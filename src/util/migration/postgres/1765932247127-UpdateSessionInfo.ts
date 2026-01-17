import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSessionInfo1765932247127 implements MigrationInterface {
    name = "UpdateSessionInfo1765932247127";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'last_seen_location_info'
                ) THEN
                    ALTER TABLE "sessions" ADD "last_seen_location_info" text;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'session_nickname'
                ) THEN
                    ALTER TABLE "sessions" ADD "session_nickname" character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'last_seen'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "last_seen" DROP NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'last_seen'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "last_seen" DROP DEFAULT;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'last_seen_ip'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "last_seen_ip" DROP NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'last_seen_ip'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "last_seen_ip" DROP DEFAULT;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'last_seen_ip'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "last_seen_ip" SET DEFAULT '127.0.0.1';
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'last_seen_ip'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "last_seen_ip" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'last_seen'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "last_seen" SET DEFAULT '1970-01-01 00:00:00';
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'last_seen'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "last_seen" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "session_nickname"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "last_seen_location_info"`);
    }
}
