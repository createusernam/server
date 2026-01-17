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

import { MigrationInterface, QueryRunner } from "typeorm";

export class templateDeleteCascade1673609867556 implements MigrationInterface {
    name = "templateDeleteCascade1673609867556";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" DROP CONSTRAINT IF EXISTS "FK_445d00eaaea0e60a017a5ed0c11"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_445d00eaaea0e60a017a5ed0c11'
                ) THEN
                    ALTER TABLE "templates" ADD CONSTRAINT "FK_445d00eaaea0e60a017a5ed0c11" 
                    FOREIGN KEY ("source_guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" DROP CONSTRAINT IF EXISTS "FK_445d00eaaea0e60a017a5ed0c11"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_445d00eaaea0e60a017a5ed0c11'
                ) THEN
                    ALTER TABLE "templates" ADD CONSTRAINT "FK_445d00eaaea0e60a017a5ed0c11" 
                    FOREIGN KEY ("source_guild_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }
}
