import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageReferenceFix1760961911873 implements MigrationInterface {
    name = "MessageReferenceFix1760961911873";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "FK_61a92bb65b302a76d9c1fcd3174"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_61a92bb65b302a76d9c1fcd3174'
                ) THEN
                    ALTER TABLE "messages" ADD CONSTRAINT "FK_61a92bb65b302a76d9c1fcd3174" 
                    FOREIGN KEY ("message_reference_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "FK_61a92bb65b302a76d9c1fcd3174"`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'FK_61a92bb65b302a76d9c1fcd3174'
                ) THEN
                    ALTER TABLE "messages" ADD CONSTRAINT "FK_61a92bb65b302a76d9c1fcd3174" 
                    FOREIGN KEY ("message_reference_id") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }
}
