import { MigrationInterface, QueryRunner } from "typeorm";

export class NewUserSettings1719776735000 implements MigrationInterface {
    name = "NewUserSettings1719776735000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings'::regclass 
                    AND attname = 'friend_discovery_flags'
                ) THEN
                    ALTER TABLE user_settings ADD COLUMN friend_discovery_flags integer DEFAULT 0;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings'::regclass 
                    AND attname = 'view_nsfw_guilds'
                ) THEN
                    ALTER TABLE user_settings ADD COLUMN view_nsfw_guilds boolean DEFAULT true;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE user_settings DROP COLUMN IF EXISTS friend_discovery_flags;");
        await queryRunner.query("ALTER TABLE user_settings DROP COLUMN IF EXISTS view_nsfw_guilds;");
    }
}
