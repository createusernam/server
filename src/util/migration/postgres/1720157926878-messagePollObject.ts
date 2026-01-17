import { MigrationInterface, QueryRunner } from "typeorm";

export class MessagePollObject1720157926878 implements MigrationInterface {
    name = "MessagePollObject1720157926878";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'messages'::regclass 
                    AND attname = 'poll'
                ) THEN
                    ALTER TABLE messages ADD poll text NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE messages DROP COLUMN IF EXISTS poll");
    }
}
