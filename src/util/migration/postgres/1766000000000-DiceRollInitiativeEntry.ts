import { MigrationInterface, QueryRunner } from "typeorm";

export class DiceRollInitiativeEntry1766000000000 implements MigrationInterface {
    name = "DiceRollInitiativeEntry1766000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "dice_rolls" (
				"id" character varying NOT NULL,
				"channel_id" character varying NOT NULL,
				"guild_id" character varying,
				"author_id" character varying NOT NULL,
				"formula" character varying NOT NULL,
				"result" integer NOT NULL,
				"roll_at" TIMESTAMP NOT NULL DEFAULT now(),
				"message_id" character varying,
				CONSTRAINT "PK_dice_rolls_id" PRIMARY KEY ("id")
			)`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_dice_rolls_channel_id" ON "dice_rolls" ("channel_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_dice_rolls_channel_id_id" ON "dice_rolls" ("channel_id", "id")`);

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "initiative_entries" (
				"id" character varying NOT NULL,
				"channel_id" character varying NOT NULL,
				"guild_id" character varying,
				"name" character varying NOT NULL,
				"value" integer NOT NULL,
				"sort_order" integer NOT NULL DEFAULT 0,
				"current_turn" boolean NOT NULL DEFAULT false,
				"created_at" TIMESTAMP NOT NULL DEFAULT now(),
				CONSTRAINT "PK_initiative_entries_id" PRIMARY KEY ("id")
			)`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_initiative_entries_channel_id" ON "initiative_entries" ("channel_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_initiative_entries_channel_id_sort_order" ON "initiative_entries" ("channel_id", "sort_order")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "dice_rolls"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "initiative_entries"`);
    }
}
