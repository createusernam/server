import { MigrationInterface, QueryRunner } from "typeorm";

export class client_status1723347738541 implements MigrationInterface {
    name = "client_status1723347738541";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'sessions'::regclass 
                    AND attname = 'client_status'
                ) THEN
                    ALTER TABLE sessions ADD client_status text NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE sessions DROP COLUMN IF EXISTS client_status");
    }
}
