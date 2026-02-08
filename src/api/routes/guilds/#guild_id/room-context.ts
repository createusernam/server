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

import { route } from "@spacebar/api";
import { Attachment, Channel, Config, getPermission, getUrlSignature, Guild, Member, Message, NewUrlSignatureData, User } from "@spacebar/util";
import { isTextChannel, Reaction } from "@spacebar/schemas";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router = Router({ mergeParams: true });

const ROOM_CONTEXT_MESSAGES_LIMIT = 25;

function logRoomContextTiming(phase: string, ms: number) {
    console.log(`[room-context] ${phase}: ${ms}ms`);
}

/**
 * GET /guilds/:guild_id/room-context
 * Returns guild channels and the first page of messages for the active channel in one request.
 * Query: channel_id (optional) — preferred channel for messages; must be in guild, text, and user must have VIEW_CHANNEL + READ_MESSAGE_HISTORY.
 * Response: { channels, active_channel_id, messages }
 * Message serialization is kept in sync with GET channels/:channel_id/messages (room-context uses lighter message relations for performance).
 */
router.get(
    "/",
    route({
        query: {
            channel_id: {
                type: "string",
                description: "Optional channel id to load messages for (last opened); must be a text channel in this guild.",
            },
        },
        responses: {
            200: {},
            401: { body: "APIErrorResponse" },
            403: {},
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const t0 = Date.now();
        const { guild_id } = req.params;
        const requestedChannelId = req.query.channel_id ? `${req.query.channel_id}` : undefined;

        let member = await Member.findOne({ where: { guild_id, id: req.user_id } });
        if (!member) {
            // Preemptive Member creation: ensure user is a member when loading room so /roll etc. do not 404 later.
            console.log("[room-context] Member not found for guild_id=%s user_id=%s, attempting addToGuild", guild_id, req.user_id);
            try {
                await Member.addToGuild(String(req.user_id), guild_id);
                member = await Member.findOne({ where: { guild_id, id: req.user_id } });
                if (member) console.log("[room-context] Member created for guild_id=%s user_id=%s", guild_id, req.user_id);
            } catch (err) {
                const isAlreadyMember = err instanceof HTTPError && err.message?.includes("already a member");
                if (isAlreadyMember) member = await Member.findOne({ where: { guild_id, id: req.user_id } });
                else console.warn("[room-context] addToGuild failed", guild_id, req.user_id, err);
            }
        }
        if (!member) throw new HTTPError("You are not a member of the guild you are trying to access", 401);
        logRoomContextTiming("member_lookup", Date.now() - t0);

        const tChannels = Date.now();
        // 1. Load channels (same logic as GET guilds/:guild_id/channels)
        const channels = await Channel.find({ where: { guild_id } });
        logRoomContextTiming("channel_load", Date.now() - tChannels);

        const tPos = Date.now();
        const guild = await Guild.findOneOrFail({ where: { id: guild_id }, select: { channel_ordering: true } });
        await Promise.all(
            channels.map(async (ch) => {
                ch.position = await Channel.calculatePosition(ch.id, guild_id, guild);
            }),
        );
        channels.sort((a, b) => a.position - b.position);
        logRoomContextTiming("calculatePosition", Date.now() - tPos);

        // 2. Determine active channel for messages: requested (if valid) or first text channel
        const textChannels = channels.filter((c) => isTextChannel(c.type));
        let activeChannelId: string | null = null;

        if (requestedChannelId) {
            const requestedChannel = channels.find((c) => c.id === requestedChannelId);
            if (requestedChannel && isTextChannel(requestedChannel.type)) {
                const perms = await getPermission(req.user_id, guild_id, requestedChannelId);
                if (perms.has("VIEW_CHANNEL") && perms.has("READ_MESSAGE_HISTORY")) {
                    activeChannelId = requestedChannelId;
                }
            }
        }
        if (!activeChannelId && textChannels.length > 0) {
            activeChannelId = textChannels[0].id;
        }

        // 3. Load messages for active channel (lighter relations for room-context: author, content, timestamp only; client uses these for list view)
        let messages: unknown[] = [];
        if (activeChannelId) {
            const channel = await Channel.findOneOrFail({
                where: { id: activeChannelId },
            });
            isTextChannel(channel.type);
            const permissions = await getPermission(req.user_id, channel.guild_id, activeChannelId);
            permissions.hasThrow("VIEW_CHANNEL");
            if (permissions.has("READ_MESSAGE_HISTORY")) {
                const tMsgLoad = Date.now();
                const messagesList = await Message.find({
                    order: { timestamp: "DESC" },
                    take: ROOM_CONTEXT_MESSAGES_LIMIT,
                    where: { channel_id: activeChannelId },
                    relations: { author: true },
                });
                logRoomContextTiming("message_load", Date.now() - tMsgLoad);

                const tSer = Date.now();
                const endpoint = Config.get().cdn.endpointPublic;
                const ret = messagesList.map((x: Message) => {
                    const msgJson = x.toJSON();
                    (msgJson.reactions || []).forEach((y: Partial<Reaction>) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if ((y.user_ids || []).includes(req.user_id)) y.me = true;
                        delete y.user_ids;
                    });
                    if (!msgJson.author)
                        msgJson.author = User.create({
                            id: "4",
                            discriminator: "0000",
                            username: "Spacebar Ghost",
                            public_flags: 0,
                        });
                    msgJson.attachments?.forEach((y: Attachment) => {
                        const uri = y.proxy_url.startsWith("http") ? y.proxy_url : `https://example.org${y.proxy_url}`;
                        const url = new URL(uri);
                        if (endpoint) {
                            const newBase = new URL(endpoint);
                            url.protocol = newBase.protocol;
                            url.hostname = newBase.hostname;
                            url.port = newBase.port;
                        }
                        y.proxy_url = url.toString();
                        y.proxy_url = getUrlSignature(
                            new NewUrlSignatureData({
                                url: y.proxy_url,
                                userAgent: req.headers["user-agent"],
                                ip: req.ip,
                            }),
                        )
                            .applyToUrl(y.proxy_url)
                            .toString();
                        y.url = getUrlSignature(
                            new NewUrlSignatureData({
                                url: y.url,
                                userAgent: req.headers["user-agent"],
                                ip: req.ip,
                            }),
                        )
                            .applyToUrl(y.url)
                            .toString();
                    });
                    return msgJson;
                });
                logRoomContextTiming("serialization", Date.now() - tSer);

                messages = ret;
            }
        }

        logRoomContextTiming("total", Date.now() - t0);
        return res.json({
            channels,
            active_channel_id: activeChannelId,
            messages,
        });
    },
);

export default router;
