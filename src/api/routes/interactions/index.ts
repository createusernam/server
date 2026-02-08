/*
  Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
  Copyright (C) 2023 Spacebar and Spacebar Contributors
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { randomBytes } from "crypto";
import { InteractionSchema } from "@spacebar/schemas";
import { route } from "@spacebar/api";
import { HTTPError } from "lambert-server";
import { Request, Response, Router } from "express";
import {
    Config,
    emitEvent,
    getDatabase,
    getPermission,
    Guild,
    InteractionCreateEvent,
    InteractionFailureEvent,
    InteractionType,
    Member,
    Message,
    Snowflake,
    User,
} from "@spacebar/util";
import { pendingInteractions } from "@spacebar/util/imports/Interactions";
import { InteractionCreateSchema } from "@spacebar/schemas/api/bots/InteractionCreateSchema";

const router = Router({ mergeParams: true });

router.post("/", route({}), async (req: Request, res: Response) => {
    const body = req.body as InteractionSchema;
    console.log("[interactions] request body.guild_id=%s body.channel_id=%s req.user_id=%s", body.guild_id, body.channel_id, req.user_id);

    const interactionId = Snowflake.generate();
    const interactionToken = randomBytes(24).toString("base64url");

    emitEvent({
        event: "INTERACTION_CREATE",
        user_id: req.user_id,
        data: {
            id: interactionId,
            nonce: body.nonce,
        },
    } as InteractionCreateEvent);

    const user = req.user;

    const interactionData: Partial<InteractionCreateSchema> = {
        id: interactionId,
        application_id: body.application_id,
        channel_id: body.channel_id,
        type: body.type,
        token: interactionToken,
        version: 1,
        entitlements: [],
        authorizing_integration_owners: { "0": req.user_id },
        attachment_size_limit: Config.get().cdn.maxAttachmentSize,
    };

    if (body.type === InteractionType.ApplicationCommand || body.type === InteractionType.MessageComponent || body.type === InteractionType.ModalSubmit) {
        interactionData.data = body.data;
    }

    if (body.type != InteractionType.Ping) {
        interactionData.locale = user?.settings?.locale;
    }

    if (body.guild_id) {
        interactionData.context = 0;
        interactionData.guild_id = body.guild_id;
        interactionData.app_permissions = (await getPermission(req.user_id, body.guild_id, body.channel_id)).bitfield.toString();

        const guildId = String(body.guild_id);
        const userId = String(req.user_id);
        const guild = await Guild.findOneOrFail({ where: { id: guildId } });
        // Same pattern as room-context and GET guilds/:id: findOne without relations (relations can make TypeORM return null when the row exists)
        let member = await Member.findOne({ where: { guild_id: guildId, id: userId } });
        let memberCreatedByAddToGuild = false;
        if (!member) {
            console.log(`[interactions] Member not found for guild_id=${guildId} user_id=${userId}, attempting addToGuild`);
            try {
                await Member.addToGuild(userId, guildId);
                memberCreatedByAddToGuild = true;
            } catch (err) {
                const isAlreadyMember = err instanceof HTTPError && err.message?.includes("already a member");
                if (isAlreadyMember) {
                    // Race or inconsistent state; re-fetch below
                } else {
                    console.warn(`[interactions] addToGuild failed guild_id=${guildId} user_id=${userId}`, err);
                }
            }
            member = await Member.findOne({ where: { guild_id: guildId, id: userId } });
            if (member && memberCreatedByAddToGuild) {
                console.log(`[interactions] Member created via addToGuild guild_id=${guildId} user_id=${userId}`);
            }
            if (!member) {
                const db = getDatabase();
                let rawRows = -1;
                let rawRow: { index: number; id: string; guild_id: string } | null = null;
                if (db) {
                    try {
                        const raw = await db.query("SELECT index, id, guild_id FROM members WHERE guild_id = $1 AND id = $2", [guildId, userId]);
                        rawRows = Array.isArray(raw) ? raw.length : 0;
                        if (rawRows === 1 && raw[0]) rawRow = raw[0] as { index: number; id: string; guild_id: string };
                    } catch (e) {
                        rawRows = -2;
                        console.warn("[interactions] 404 diagnostic: raw SELECT failed", e);
                    }
                }
                const dbHint = (() => {
                    const u = process.env.DATABASE;
                    if (!u || typeof u !== "string") return "DATABASE not set";
                    try {
                        const url = new URL(u.replace(/^postgres:\/\//, "http://"));
                        return `${url.hostname}:${url.port || "5432"}${url.pathname || ""}`;
                    } catch {
                        return "DATABASE url parse failed";
                    }
                })();
                if (rawRow) {
                    member = await Member.findOne({ where: { index: String(rawRow.index) } });
                    if (member && !member.user) member.user = await User.findOneOrFail({ where: { id: member.id } });
                }
                if (!member) {
                    console.warn("[interactions] 404: member still null after addToGuild guild_id=%s user_id=%s raw_select_rows=%s db=%s", guildId, userId, rawRows, dbHint);
                    throw new HTTPError("Member could not be found", 404);
                }
            }
        }
        if (!member.user) {
            member.user = await User.findOneOrFail({ where: { id: member.id } });
        }

        interactionData.guild = {
            id: guild.id,
            features: guild.features,
            locale: guild.preferred_locale!,
        };

        interactionData.guild_locale = guild.preferred_locale;
        interactionData.member = member.toPublicMember();
    } else {
        interactionData.user = user.toPublicUser();
        interactionData.app_permissions = (await getPermission(req.user_id, "", body.channel_id)).bitfield.toString();

        if (body.channel_id === body.application_id) {
            interactionData.context = 1;
        } else {
            interactionData.context = 2;
        }
    }

    if (body.type === InteractionType.MessageComponent || body.data.type === InteractionType.ModalSubmit) {
        interactionData.message = await Message.findOneOrFail({ where: { id: body.message_id, flags: undefined }, relations: { author: true } });
    }

    const interactionTimeout = setTimeout(() => {
        emitEvent({
            event: "INTERACTION_FAILURE",
            user_id: req.user_id,
            data: {
                id: interactionId,
                nonce: body.nonce,
                reason_code: 2, // when types are done: InteractionFailureReason.TIMEOUT,
            },
        } as InteractionFailureEvent);
    }, 3000);

    pendingInteractions.set(interactionId, {
        timeout: interactionTimeout,
        nonce: body.nonce,
        applicationId: body.application_id,
        userId: req.user_id,
        guildId: body.guild_id,
        channelId: body.channel_id,
        type: body.type,
        commandType: body.data.type,
        commandName: body.data.name,
    });

    emitEvent({
        event: "INTERACTION_CREATE",
        user_id: body.application_id,
        data: interactionData,
    } as InteractionCreateEvent);

    res.sendStatus(204);
});

export default router;
