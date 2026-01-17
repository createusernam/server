import { MigrationInterface, QueryRunner } from "typeorm";

export class WebhookSourceChannel1723644478176 implements MigrationInterface {
    name = "WebhookSourceChannel1723644478176";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'webhooks'::regclass 
                    AND attname = 'source_channel_id'
                ) THEN
                    ALTER TABLE webhooks ADD COLUMN source_channel_id VARCHAR(255) NULL DEFAULT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_d64f38834fa676f6caa4786ddd6'
                ) THEN
                    ALTER TABLE webhooks ADD CONSTRAINT FK_d64f38834fa676f6caa4786ddd6 
                    FOREIGN KEY (source_channel_id) REFERENCES channels (id) ON UPDATE NO ACTION ON DELETE CASCADE;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE webhooks DROP CONSTRAINT IF EXISTS FK_d64f38834fa676f6caa4786ddd6");
        await queryRunner.query("ALTER TABLE webhooks DROP COLUMN IF EXISTS source_channel_id");
    }
}
