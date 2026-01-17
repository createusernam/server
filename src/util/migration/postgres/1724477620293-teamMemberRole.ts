import { MigrationInterface, QueryRunner } from "typeorm";

export class TeamMemberRole1724477620293 implements MigrationInterface {
    name = "TeamMemberRole1724477620293";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'team_members'::regclass 
                    AND attname = 'role'
                ) THEN
                    ALTER TABLE team_members ADD COLUMN role text NOT NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE team_members DROP COLUMN IF EXISTS role");
    }
}
