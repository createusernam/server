import { MigrationInterface, QueryRunner } from "typeorm";

export class DontIpBanBanner1765143034407 implements MigrationInterface {
    name = "DontIpBanBanner1765143034407";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'bans'::regclass 
                    AND attname = 'ip'
                ) THEN
                    ALTER TABLE "bans" ALTER COLUMN "ip" DROP NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'bans'::regclass 
                    AND attname = 'ip'
                ) THEN
                    UPDATE "bans" SET "ip" = NULL;
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
                    WHERE attrelid = 'bans'::regclass 
                    AND attname = 'ip'
                ) THEN
                    UPDATE "bans" SET "ip" = '0.0.0.0' WHERE "ip" IS NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'bans'::regclass 
                    AND attname = 'ip'
                ) THEN
                    ALTER TABLE "bans" ALTER COLUMN "ip" SET NOT NULL;
                END IF;
            END $$;
        `);
    }
}
