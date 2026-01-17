import { MigrationInterface, QueryRunner } from "typeorm";

export class CloudAttachments1758654246197 implements MigrationInterface {
    name = "CloudAttachments1758654246197";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cloud_attachments" ("id" character varying NOT NULL, "user_id" character varying, "channel_id" character varying, "upload_filename" character varying NOT NULL, "user_attachment_id" character varying, "user_filename" character varying NOT NULL, "user_file_size" integer, "user_original_content_type" character varying, "user_is_clip" boolean, "size" integer, "height" integer, "width" integer, "content_type" character varying, "userId" character varying, "channelId" character varying, CONSTRAINT "PK_5794827a3ee7c9318612dcb70c8" PRIMARY KEY ("id"))`,
        );
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP CONSTRAINT IF EXISTS "FK_cab965a18f8ca30293bff3d50a8"`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP CONSTRAINT IF EXISTS "FK_e6b32df2004e8ad0f488b4a2019"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cloud_attachments"`);
    }
}
