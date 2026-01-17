import { MigrationInterface, QueryRunner } from "typeorm";

export class DropDefaultIPDataKey1765665440000 implements MigrationInterface {
    name = "DropDefaultIPDataKey1765665440000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'config'::regclass 
                    AND attname = 'value'
                ) AND EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'config'::regclass 
                    AND attname = 'key'
                ) THEN
                    UPDATE "config" SET "value" = NULL WHERE "key" = 'security_ipdataApiKey' AND "value" = '"eca677b284b3bac29eb72f5e496aa9047f26543605efe99ff2ce35c9"';
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
                    WHERE attrelid = 'config'::regclass 
                    AND attname = 'value'
                ) AND EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'config'::regclass 
                    AND attname = 'key'
                ) THEN
                    UPDATE "config" SET "value" = '"eca677b284b3bac29eb72f5e496aa9047f26543605efe99ff2ce35c9"' WHERE "key" = 'security_ipdataApiKey' AND "value" IS NULL;
                END IF;
            END $$;
        `);
    }
}
