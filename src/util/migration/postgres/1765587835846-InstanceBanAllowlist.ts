import { MigrationInterface, QueryRunner } from "typeorm";

export class InstanceBanAllowlist1765587835846 implements MigrationInterface {
    name = "InstanceBanAllowlist1765587835846";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'instance_bans'::regclass 
                    AND attname = 'is_allowlisted'
                ) THEN
                    ALTER TABLE "instance_bans" ADD "is_allowlisted" boolean NOT NULL DEFAULT false;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instance_bans" DROP COLUMN IF EXISTS "is_allowlisted"`);
    }
}
