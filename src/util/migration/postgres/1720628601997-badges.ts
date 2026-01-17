import { MigrationInterface, QueryRunner } from "typeorm";

export class Badges1720628601997 implements MigrationInterface {
    name = "Badges1720628601997";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "badges" ("id" character varying NOT NULL, "description" character varying NOT NULL, "icon" character varying NOT NULL, "link" character varying, CONSTRAINT "PK_8a651318b8de577e8e217676466" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'users'::regclass 
                    AND attname = 'badge_ids'
                ) THEN
                    ALTER TABLE "users" ADD "badge_ids" text;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "badge_ids"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "badges"`);
    }
}
