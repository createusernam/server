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
import { Channel, InitiativeEntry } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router: Router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        permission: "VIEW_CHANNEL",
        responses: {
            201: {},
            400: {},
            403: {},
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id } = req.params;
        const { name, value } = req.body as { name?: string; value?: number };

        if (typeof name !== "string" || name.length === 0) {
            throw new HTTPError("name is required and must be a non-empty string", 400);
        }
        const numValue = typeof value === "number" ? value : parseInt(String(value), 10);
        if (Number.isNaN(numValue)) {
            throw new HTTPError("value is required and must be a number", 400);
        }

        const channel = await Channel.findOne({
            where: { id: channel_id },
        });
        if (!channel) throw new HTTPError("Channel not found", 404);

        const maxOrder = await InitiativeEntry.createQueryBuilder("e")
            .select("MAX(e.sort_order)", "max")
            .where("e.channel_id = :channel_id", { channel_id })
            .getRawOne<{ max: number | null }>();
        const nextOrder = (maxOrder?.max ?? 0) + 1;

        const entry = new InitiativeEntry();
        entry.channel_id = channel_id;
        entry.guild_id = channel.guild_id ?? undefined;
        entry.name = name;
        entry.value = numValue;
        entry.sort_order = nextOrder;
        entry.current_turn = false;
        await entry.save();

        res.status(201).json(entry);
    },
);

export default router;
