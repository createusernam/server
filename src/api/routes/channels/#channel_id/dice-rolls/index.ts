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
import { Channel, DiceRoll } from "@spacebar/util";
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
        const { formula, result, message_id } = req.body as { formula?: string; result?: number; message_id?: string };

        if (typeof formula !== "string" || formula.length === 0) {
            throw new HTTPError("formula is required and must be a non-empty string", 400);
        }
        if (typeof result !== "number") {
            throw new HTTPError("result is required and must be a number", 400);
        }

        const channel = await Channel.findOne({
            where: { id: channel_id },
        });
        if (!channel) throw new HTTPError("Channel not found", 404);

        const roll = new DiceRoll();
        roll.channel_id = channel_id;
        roll.guild_id = channel.guild_id ?? undefined;
        roll.author_id = req.user_id;
        roll.formula = formula;
        roll.result = Math.floor(result);
        roll.message_id = typeof message_id === "string" ? message_id : undefined;
        await roll.save();

        res.status(201).json(roll);
    },
);

export default router;
