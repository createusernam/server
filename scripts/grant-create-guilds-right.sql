-- Grant CREATE_GUILDS right to all users (P1/P2: everyone can create rooms/guilds).
-- Run manually if needed (e.g. under /cto). Otherwise the migration 1766000000001-GrantCreateGuildsToAll runs on deploy.
-- CREATE_GUILDS = bit 14 = 16384

UPDATE users
SET rights = rights | 16384
WHERE (rights & 16384) = 0;
