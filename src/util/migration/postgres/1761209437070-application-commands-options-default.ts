import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationCommandsOptionsDefault1761209437070 implements MigrationInterface {
    name = "ApplicationCommandsOptionsDefault1761209437070";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'application_commands'::regclass 
                    AND attname = 'options'
                ) THEN
                    UPDATE "application_commands" SET "options" = '[]' WHERE "options" IS NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'application_commands'::regclass 
                    AND attname = 'options'
                ) THEN
                    ALTER TABLE "application_commands" ALTER COLUMN "options" SET NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'application_commands'::regclass 
                    AND attname = 'options'
                ) THEN
                    ALTER TABLE "application_commands" ALTER COLUMN "options" SET DEFAULT '[]';
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
                    WHERE attrelid = 'application_commands'::regclass 
                    AND attname = 'options'
                ) THEN
                    ALTER TABLE "application_commands" ALTER COLUMN "options" DROP DEFAULT;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'application_commands'::regclass 
                    AND attname = 'options'
                ) THEN
                    ALTER TABLE "application_commands" ALTER COLUMN "options" DROP NOT NULL;
                END IF;
            END $$;
        `);
    }
}
