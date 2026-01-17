import { MigrationInterface, QueryRunner } from "typeorm";

export class CloudAttachmentsFixIdRefs1758654621365 implements MigrationInterface {
    name = "CloudAttachmentsFixIdRefs1758654621365";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP CONSTRAINT IF EXISTS "FK_cab965a18f8ca30293bff3d50a8"`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP CONSTRAINT IF EXISTS "FK_e6b32df2004e8ad0f488b4a2019"`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP COLUMN IF EXISTS "channelId"`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP COLUMN IF EXISTS "userId"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_8bf8cc8767e48cb482ff644fce6'
                ) THEN
                    ALTER TABLE "cloud_attachments" ADD CONSTRAINT "FK_8bf8cc8767e48cb482ff644fce6" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_998d5fe91008ba5b09e1322104c'
                ) THEN
                    ALTER TABLE "cloud_attachments" ADD CONSTRAINT "FK_998d5fe91008ba5b09e1322104c" 
                    FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP CONSTRAINT IF EXISTS "FK_998d5fe91008ba5b09e1322104c"`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP CONSTRAINT IF EXISTS "FK_8bf8cc8767e48cb482ff644fce6"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'cloud_attachments'::regclass 
                    AND attname = 'userId'
                ) THEN
                    ALTER TABLE "cloud_attachments" ADD "userId" character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'cloud_attachments'::regclass 
                    AND attname = 'channelId'
                ) THEN
                    ALTER TABLE "cloud_attachments" ADD "channelId" character varying;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_e6b32df2004e8ad0f488b4a2019'
                ) THEN
                    ALTER TABLE "cloud_attachments" ADD CONSTRAINT "FK_e6b32df2004e8ad0f488b4a2019" 
                    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_cab965a18f8ca30293bff3d50a8'
                ) THEN
                    ALTER TABLE "cloud_attachments" ADD CONSTRAINT "FK_cab965a18f8ca30293bff3d50a8" 
                    FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }
}
