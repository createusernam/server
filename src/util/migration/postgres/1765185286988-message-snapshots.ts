import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageSnapshots1765185286988 implements MigrationInterface {
    name = "MessageSnapshots1765185286988";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'message_snapshots'
                ) THEN
                    ALTER TABLE "messages" ADD "message_snapshots" text NOT NULL DEFAULT '[]';
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "message_snapshots"`);
    }
}
