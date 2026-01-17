import { MigrationInterface, QueryRunner } from "typeorm";

export class MessagePinnedAt1752383879533 implements MigrationInterface {
    name = "MessagePinnedAt1752383879533";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'pinned_at'
                ) THEN
                    ALTER TABLE "messages" ADD "pinned_at" TIMESTAMP;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'pinned'
                ) THEN
                    UPDATE "messages" SET "pinned_at" = NOW() WHERE "pinned" = true;
                END IF;
            END $$;
        `);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "pinned"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'pinned'
                ) THEN
                    ALTER TABLE "messages" ADD "pinned" boolean;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'pinned_at'
                ) THEN
                    UPDATE "messages" SET "pinned" = true WHERE "pinned_at" IS NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "pinned_at"`);
    }
}
