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
            200: {},
            403: {},
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id } = req.params;

        const channel = await Channel.findOne({
            where: { id: channel_id },
        });
        if (!channel) throw new HTTPError("Channel not found", 404);

        const entries = await InitiativeEntry.find({
            where: { channel_id },
            order: { value: "DESC", sort_order: "ASC", created_at: "ASC" },
        });

        if (entries.length === 0) {
            return res.json({ current: null, entries: [] });
        }

        const currentIndex = entries.findIndex((e) => e.current_turn);
        let nextIndex: number;
        if (currentIndex < 0) {
            nextIndex = 0;
        } else {
            nextIndex = (currentIndex + 1) % entries.length;
        }

        await InitiativeEntry.update({ channel_id }, { current_turn: false });
        const nextEntry = entries[nextIndex];
        nextEntry.current_turn = true;
        await nextEntry.save();

        return res.json({
            current: { id: nextEntry.id, name: nextEntry.name, value: nextEntry.value },
            entries: entries.map((e) => ({
                id: e.id,
                name: e.name,
                value: e.value,
                sort_order: e.sort_order,
                current_turn: e.id === nextEntry.id,
            })),
        });
    },
);

export default router;
