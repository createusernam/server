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
import { User } from "./User";

@Entity({
    name: "dice_rolls",
})
@Index(["channel_id", "id"])
export class DiceRoll extends BaseClass {
    @Column()
    @Index()
    channel_id: string;

    @JoinColumn({ name: "channel_id" })
    @ManyToOne(() => Channel, { onDelete: "CASCADE" })
    channel: Channel;

    @Column({ nullable: true })
    @Index()
    guild_id?: string;

    @JoinColumn({ name: "guild_id" })
    @ManyToOne(() => Guild, { onDelete: "CASCADE", nullable: true })
    guild?: Guild;

    @Column()
    @Index()
    author_id: string;

    @JoinColumn({ name: "author_id" })
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    author: User;

    @Column()
    formula: string;

    @Column({ type: "int" })
    result: number;

    @CreateDateColumn()
    roll_at: Date;

    @Column({ nullable: true })
    message_id?: string;
}
