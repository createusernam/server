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

import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Guild } from "./Guild";

@Entity({
    name: "initiative_entries",
})
@Index(["channel_id", "sort_order"])
export class InitiativeEntry extends BaseClass {
    @Column()
    @Index()
    channel_id: string;

    @JoinColumn({ name: "channel_id" })
    @ManyToOne(() => Channel, { onDelete: "CASCADE" })
    channel: Channel;

    @Column({ nullable: true })
    guild_id?: string;

    @JoinColumn({ name: "guild_id" })
    @ManyToOne(() => Guild, { onDelete: "CASCADE", nullable: true })
    guild?: Guild;

    @Column()
    name: string;

    @Column({ type: "int" })
    value: number;

    @Column({ type: "int", default: 0 })
    sort_order: number;

    @Column({ type: "boolean", default: false })
    current_turn: boolean;

    @CreateDateColumn()
    created_at: Date;
}
