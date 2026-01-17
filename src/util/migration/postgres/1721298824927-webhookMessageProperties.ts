import { MigrationInterface, QueryRunner } from "typeorm";

export class WebhookMessageProperties1721298824927 implements MigrationInterface {
    name = "WebhookMessageProperties1721298824927";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'username'
                ) THEN
                    ALTER TABLE messages ADD username text NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'avatar'
                ) THEN
                    ALTER TABLE messages ADD avatar text NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE messages DROP COLUMN IF EXISTS username");
        await queryRunner.query("ALTER TABLE messages DROP COLUMN IF EXISTS avatar");
    }
}
