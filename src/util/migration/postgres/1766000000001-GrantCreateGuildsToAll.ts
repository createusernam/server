import { MigrationInterface, QueryRunner } from "typeorm";

const CREATE_GUILDS_BIT = 16384; // Rights.FLAGS.CREATE_GUILDS = BitFlag(14) = 2^14

/**
 * Grant CREATE_GUILDS right to all users (P1/P2: allow everyone to create rooms/guilds).
 */
export class GrantCreateGuildsToAll1766000000001 implements MigrationInterface {
    name = "GrantCreateGuildsToAll1766000000001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE users SET rights = rights | ${CREATE_GUILDS_BIT} WHERE (rights & ${CREATE_GUILDS_BIT}) = 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE users SET rights = rights & ~${CREATE_GUILDS_BIT}`);
    }
}
