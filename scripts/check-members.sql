-- Проверка связки участник–гильдия (этап 3 плана диагностики 404 Member).
-- Таблица: members (поля: id = user_id, guild_id).
-- Запуск: см. check-members.sh

\set QUIET on
\echo '=== 1) Member для пары (user_id, guild_id) ==='
SELECT id AS user_id, guild_id, joined_at
FROM members
WHERE id = :'user_id' AND guild_id = :'guild_id';

\echo ''
\echo '=== 2) Все гильдии этого пользователя ==='
SELECT guild_id, joined_at
FROM members
WHERE id = :'user_id'
ORDER BY joined_at;

\echo ''
\echo '=== 3) Владелец гильдии (guild_id) ==='
SELECT id AS guild_id, owner_id
FROM guilds
WHERE id = :'guild_id';

\echo ''
\echo '=== 4) Есть ли user_id в гильдии? (yes/no) ==='
SELECT CASE WHEN COUNT(*) > 0 THEN 'yes' ELSE 'no' END AS member_exists
FROM members
WHERE id = :'user_id' AND guild_id = :'guild_id';
