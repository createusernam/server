import { MigrationInterface, QueryRunner } from "typeorm";

export class guildChannelOrdering1696420827239 implements MigrationInterface {
    name = "guildChannelOrdering1696420827239";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const guilds = await queryRunner.query(`SELECT id FROM guilds`, undefined, true);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'guilds'::regclass 
                    AND attname = 'channel_ordering'
                ) THEN
                    ALTER TABLE guilds ADD channel_ordering text NOT NULL DEFAULT '[]';
                END IF;
            END $$;
        `);

        const positionExists = await queryRunner.query(`
            SELECT 1 
            FROM pg_attribute 
            WHERE attrelid = 'channels'::regclass 
            AND attname = 'position'
        `);

        if (positionExists && positionExists.length > 0) {
            for (const guild_id of guilds.records.map((x) => x.id)) {
                const channels: Array<{ position: number; id: string }> = (await queryRunner.query(`SELECT id, position FROM channels WHERE guild_id = $1`, [guild_id], true))
                    .records;

                channels.sort((a, b) => a.position - b.position);

                const channelOrderingValue = JSON.stringify(channels.map((x) => x.id));
                await queryRunner.query(`
                    DO $$ 
                    BEGIN
                        IF EXISTS (
                            SELECT 1 
                            FROM pg_attribute 
                            WHERE attrelid = 'guilds'::regclass 
                            AND attname = 'channel_ordering'
                        ) THEN
                            UPDATE guilds SET channel_ordering = '${channelOrderingValue.replace(/'/g, "''")}' WHERE id = '${guild_id.replace(/'/g, "''")}';
                        END IF;
                    END $$;
                `);
            }
        }

        await queryRunner.query(`ALTER TABLE channels DROP COLUMN IF EXISTS position`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_attribute 
                    WHERE attrelid = 'channels'::regclass 
                    AND attname = 'position'
                ) THEN
                    ALTER TABLE channels ADD position integer NOT NULL DEFAULT 0;
                END IF;
            END $$;
        `);

        const channelOrderingExists = await queryRunner.query(`
            SELECT 1 
            FROM pg_attribute 
            WHERE attrelid = 'guilds'::regclass 
            AND attname = 'channel_ordering'
        `);

        if (channelOrderingExists && channelOrderingExists.length > 0) {
            const guilds = await queryRunner.query(`SELECT id, channel_ordering FROM guilds`, undefined, true);

            for (const guild of guilds.records) {
                const channel_ordering: string[] = JSON.parse(guild.channel_ordering);

                for (let i = 0; i < channel_ordering.length; i++) {
                    const channel_id = channel_ordering[i];
                    await queryRunner.query(`
                        DO $$ 
                        BEGIN
                            IF EXISTS (
                                SELECT 1 
                                FROM pg_attribute 
                                WHERE attrelid = 'channels'::regclass 
                                AND attname = 'position'
                            ) THEN
                                UPDATE channels SET position = ${i} WHERE id = '${channel_id.replace(/'/g, "''")}';
                            END IF;
                        END $$;
                    `);
                }
            }
        }

        await queryRunner.query(`ALTER TABLE guilds DROP COLUMN IF EXISTS channel_ordering`);
    }
}
