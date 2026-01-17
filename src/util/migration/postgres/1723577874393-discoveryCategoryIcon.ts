import { MigrationInterface, QueryRunner } from "typeorm";

export class DiscoveryCategoryIcon1723577874393 implements MigrationInterface {
    name = "DiscoveryCategoryIcon1723577874393";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'categories'::regclass 
                    AND attname = 'icon'
                ) THEN
                    ALTER TABLE categories ADD icon text NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE categories DROP COLUMN IF EXISTS icon");
    }
}
