import { MigrationInterface, QueryRunner } from "typeorm";

export class ReconcileMigrationAttempts1760622755598 implements MigrationInterface {
    name = "ReconcileMigrationAttempts1760622755598";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // doesnt work because initial setup is syncDb()
        //await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "fk_d64f38834fa676f6caa4786ddd6"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'webhooks'::regclass 
                    AND attname = 'source_channel_id'
                ) THEN
                    ALTER TABLE "webhooks" ALTER COLUMN "source_channel_id" TYPE character varying;
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
                    AND attname = 'username'
                ) THEN
                    ALTER TABLE "messages" ALTER COLUMN "username" TYPE character varying;
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
                    AND attname = 'avatar'
                ) THEN
                    ALTER TABLE "messages" ALTER COLUMN "avatar" TYPE character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'channels'::regclass 
                    AND attname = 'default_thread_rate_limit_per_user'
                ) THEN
                    ALTER TABLE "channels" ALTER COLUMN "default_thread_rate_limit_per_user" DROP NOT NULL;
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
                    AND attname = 'client_status'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "client_status" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings'::regclass 
                    AND attname = 'friend_discovery_flags'
                ) THEN
                    ALTER TABLE "user_settings" ALTER COLUMN "friend_discovery_flags" DROP DEFAULT;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings'::regclass 
                    AND attname = 'view_nsfw_guilds'
                ) THEN
                    ALTER TABLE "user_settings" ALTER COLUMN "view_nsfw_guilds" DROP DEFAULT;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'users'::regclass 
                    AND attname = 'flags'
                ) THEN
                    ALTER TABLE "users" ALTER COLUMN "flags" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'users'::regclass 
                    AND attname = 'public_flags'
                ) THEN
                    ALTER TABLE "users" ALTER COLUMN "public_flags" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'users'::regclass 
                    AND attname = 'purchased_flags'
                ) THEN
                    ALTER TABLE "users" ALTER COLUMN "purchased_flags" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'team_members'::regclass 
                    AND attname = 'role'
                ) THEN
                    ALTER TABLE "team_members" ALTER COLUMN "role" TYPE character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'team_members'::regclass 
                    AND attname = 'role'
                ) THEN
                    ALTER TABLE "team_members" ALTER COLUMN "role" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'applications'::regclass 
                    AND attname = 'guild_id'
                ) THEN
                    ALTER TABLE "applications" ALTER COLUMN "guild_id" TYPE character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'applications'::regclass 
                    AND attname = 'custom_install_url'
                ) THEN
                    ALTER TABLE "applications" ALTER COLUMN "custom_install_url" TYPE character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'categories'::regclass 
                    AND attname = 'icon'
                ) THEN
                    ALTER TABLE "categories" ALTER COLUMN "icon" TYPE character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings_protos'::regclass 
                    AND attname = 'userSettings'
                ) THEN
                    ALTER TABLE "user_settings_protos" ALTER COLUMN "userSettings" TYPE character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings_protos'::regclass 
                    AND attname = 'frecencySettings'
                ) THEN
                    ALTER TABLE "user_settings_protos" ALTER COLUMN "frecencySettings" TYPE character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_4495b7032a33c6b8b605d030398'
                ) THEN
                    ALTER TABLE "webhooks" ADD CONSTRAINT "FK_4495b7032a33c6b8b605d030398" 
                    FOREIGN KEY ("source_channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_e5bf78cdbbe9ba91062d74c5aba'
                ) THEN
                    ALTER TABLE "applications" ADD CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba" 
                    FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_e5bf78cdbbe9ba91062d74c5aba"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT IF EXISTS "FK_4495b7032a33c6b8b605d030398"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings_protos'::regclass 
                    AND attname = 'frecencySettings'
                ) THEN
                    ALTER TABLE "user_settings_protos" ALTER COLUMN "frecencySettings" TYPE text;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings_protos'::regclass 
                    AND attname = 'userSettings'
                ) THEN
                    ALTER TABLE "user_settings_protos" ALTER COLUMN "userSettings" TYPE text;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'categories'::regclass 
                    AND attname = 'icon'
                ) THEN
                    ALTER TABLE "categories" ALTER COLUMN "icon" TYPE text;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'applications'::regclass 
                    AND attname = 'custom_install_url'
                ) THEN
                    ALTER TABLE "applications" ALTER COLUMN "custom_install_url" TYPE text;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'applications'::regclass 
                    AND attname = 'guild_id'
                ) THEN
                    ALTER TABLE "applications" ALTER COLUMN "guild_id" TYPE text;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'team_members'::regclass 
                    AND attname = 'role'
                ) THEN
                    ALTER TABLE "team_members" ALTER COLUMN "role" TYPE text;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'team_members'::regclass 
                    AND attname = 'role'
                ) THEN
                    ALTER TABLE "team_members" ALTER COLUMN "role" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'users'::regclass 
                    AND attname = 'purchased_flags'
                ) THEN
                    ALTER TABLE "users" ALTER COLUMN "purchased_flags" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'users'::regclass 
                    AND attname = 'public_flags'
                ) THEN
                    ALTER TABLE "users" ALTER COLUMN "public_flags" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'users'::regclass 
                    AND attname = 'flags'
                ) THEN
                    ALTER TABLE "users" ALTER COLUMN "flags" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings'::regclass 
                    AND attname = 'view_nsfw_guilds'
                ) THEN
                    ALTER TABLE "user_settings" ALTER COLUMN "view_nsfw_guilds" SET DEFAULT true;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'user_settings'::regclass 
                    AND attname = 'friend_discovery_flags'
                ) THEN
                    ALTER TABLE "user_settings" ALTER COLUMN "friend_discovery_flags" SET DEFAULT '0';
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
                    AND attname = 'client_status'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "client_status" DROP NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'channels'::regclass 
                    AND attname = 'default_thread_rate_limit_per_user'
                ) THEN
                    ALTER TABLE "channels" ALTER COLUMN "default_thread_rate_limit_per_user" SET NOT NULL;
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
                    AND attname = 'avatar'
                ) THEN
                    ALTER TABLE "messages" ALTER COLUMN "avatar" TYPE text;
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
                    AND attname = 'username'
                ) THEN
                    ALTER TABLE "messages" ALTER COLUMN "username" TYPE text;
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
                    ALTER TABLE "webhooks" ALTER COLUMN "source_channel_id" TYPE character varying(255);
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
                    ALTER TABLE "webhooks" ALTER COLUMN "source_channel_id" SET DEFAULT NULL;
                END IF;
            END $$;
        `);
        // await queryRunner.query(`ALTER TABLE "webhooks" ADD CONSTRAINT "fk_d64f38834fa676f6caa4786ddd6" FOREIGN KEY ("source_channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
