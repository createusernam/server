import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationProperties1725090962922 implements MigrationInterface {
    name = "ApplicationProperties1725090962922";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'applications'::regclass 
                    AND attname = 'guild_id'
                ) THEN
                    ALTER TABLE applications ADD COLUMN guild_id TEXT NULL DEFAULT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'applications'::regclass 
                    AND attname = 'custom_install_url'
                ) THEN
                    ALTER TABLE applications ADD COLUMN custom_install_url TEXT NULL DEFAULT NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE applications DROP COLUMN IF EXISTS guild_id");
        await queryRunner.query("ALTER TABLE applications DROP COLUMN IF EXISTS custom_install_url");
    }
}
