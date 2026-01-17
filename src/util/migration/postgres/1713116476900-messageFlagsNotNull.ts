import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageFlagsNotNull1713116476900 implements MigrationInterface {
    name = "MessageFlagsNotNull1713116476900";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'flags'
                ) THEN
                    ALTER TABLE messages RENAME COLUMN flags TO flags_old;
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
                    AND attname = 'flags'
                ) THEN
                    ALTER TABLE messages ADD COLUMN flags integer NOT NULL DEFAULT 0;
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
                    AND attname = 'flags_old'
                ) THEN
                    UPDATE messages SET flags = COALESCE(flags_old, 0);
                END IF;
            END $$;
        `);
        await queryRunner.query("ALTER TABLE messages DROP COLUMN IF EXISTS flags_old;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'flags'
                ) THEN
                    ALTER TABLE messages RENAME COLUMN flags TO flags_new;
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
                    AND attname = 'flags'
                ) THEN
                    ALTER TABLE messages ADD COLUMN flags integer;
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
                    AND attname = 'flags_new'
                ) THEN
                    UPDATE messages SET flags = flags_new;
                END IF;
            END $$;
        `);
        await queryRunner.query("ALTER TABLE messages DROP COLUMN IF EXISTS flags_new;");
    }
}
