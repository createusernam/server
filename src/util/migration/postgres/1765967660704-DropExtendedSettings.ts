import { MigrationInterface, QueryRunner } from "typeorm";

export class DropExtendedSettings1765967660704 implements MigrationInterface {
    name = "DropExtendedSettings1765967660704";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "extended_settings"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'users'::regclass 
                    AND attname = 'extended_settings'
                ) THEN
                    ALTER TABLE "users" ADD "extended_settings" text NOT NULL;
                END IF;
            END $$;
        `);
    }
}
