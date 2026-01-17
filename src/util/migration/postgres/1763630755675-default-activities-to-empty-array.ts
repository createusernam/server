import { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultActivitiesToEmptyArray1763630755675 implements MigrationInterface {
    name = "DefaultActivitiesToEmptyArray1763630755675";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'activities'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "activities" SET NOT NULL;
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
                    AND attname = 'activities'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "activities" SET DEFAULT '[]';
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
                    AND attname = 'activities'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "activities" DROP DEFAULT;
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
                    AND attname = 'activities'
                ) THEN
                    ALTER TABLE "sessions" ALTER COLUMN "activities" DROP NOT NULL;
                END IF;
            END $$;
        `);
    }
}
