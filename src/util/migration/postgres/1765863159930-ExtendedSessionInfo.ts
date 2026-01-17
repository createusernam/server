import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendedSessionInfo1765863159930 implements MigrationInterface {
    name = "ExtendedSessionInfo1765863159930";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "PK_3238ef96f18b355b671619111bc"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "id"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'is_admin_session'
                ) THEN
                    ALTER TABLE "sessions" ADD "is_admin_session" boolean NOT NULL DEFAULT false;
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
                    AND attname = 'created_at'
                ) THEN
                    ALTER TABLE "sessions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now();
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
                    AND attname = 'last_seen'
                ) THEN
                    ALTER TABLE "sessions" ADD "last_seen" TIMESTAMP NOT NULL DEFAULT '1970-01-01 00:00:00';
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
                    AND attname = 'last_seen_ip'
                ) THEN
                    ALTER TABLE "sessions" ADD "last_seen_ip" character varying NOT NULL DEFAULT '127.0.0.1';
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
                    AND attname = 'last_seen_location'
                ) THEN
                    ALTER TABLE "sessions" ADD "last_seen_location" character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'webhooks'::regclass 
                    AND attname = 'source_channel_id'
                ) THEN
                    ALTER TABLE "webhooks" ALTER COLUMN "source_channel_id" DROP DEFAULT;
                END IF;
            END $$;
        `);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "FK_085d540d9f418cfbdc7bd55bb19"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'PK_9340188c93349808f10d1db74a8'
                ) THEN
                    ALTER TABLE "sessions" ADD CONSTRAINT "PK_9340188c93349808f10d1db74a8" PRIMARY KEY ("session_id");
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
                    AND attname = 'user_id'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "user_id" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_085d540d9f418cfbdc7bd55bb1" ON "sessions" ("user_id") `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_085d540d9f418cfbdc7bd55bb19'
                ) THEN
                    ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "FK_085d540d9f418cfbdc7bd55bb19"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT IF EXISTS "FK_4495b7032a33c6b8b605d030398"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_085d540d9f418cfbdc7bd55bb1"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'user_id'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "user_id" DROP NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "PK_9340188c93349808f10d1db74a8"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_085d540d9f418cfbdc7bd55bb19'
                ) THEN
                    ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "last_seen_location"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "last_seen_ip"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "last_seen"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "created_at"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "is_admin_session"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'id'
                ) THEN
                    ALTER TABLE "sessions" ADD "id" character varying NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'PK_3238ef96f18b355b671619111bc'
                ) THEN
                    ALTER TABLE "sessions" ADD CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id");
                END IF;
            END $$;
        `);
    }
}
