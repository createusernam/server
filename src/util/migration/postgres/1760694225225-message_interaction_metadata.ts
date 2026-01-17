import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageInteractionMetadata1760694225225 implements MigrationInterface {
    name = "MessageInteractionMetadata1760694225225";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'interaction_metadata'
                ) THEN
                    ALTER TABLE "messages" ADD "interaction_metadata" text;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "interaction_metadata"`);
    }
}
