import { MigrationInterface, QueryRunner } from "typeorm";

export class FixGifStickersFormatType1762611552514 implements MigrationInterface {
    name = "FixGifStickersFormatType1762611552514";
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'stickers'::regclass 
                    AND attname = 'format_type'
                ) THEN
                    UPDATE "stickers" SET "format_type" = 4 WHERE "format_type" = 0;
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
                    WHERE attrelid = 'stickers'::regclass 
                    AND attname = 'format_type'
                ) THEN
                    UPDATE "stickers" SET "format_type" = 0 WHERE "format_type" = 4;
                END IF;
            END $$;
        `);
    }
}
