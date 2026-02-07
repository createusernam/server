#!/usr/bin/env bash
# Проверка связки участник–гильдия (этап 3 плана диагностики 404 Member).
# Нужны user_id и guild_id из логов API ([interactions] ... user_id=... guild_id=...) или из клиента.
#
# Использование на VPS:
#   cd /opt/spacebar/server
#   chmod +x scripts/check-members.sh
#   export DATABASE='postgres://user:pass@localhost:5432/spacebar'   # или из .env
#   ./scripts/check-members.sh <user_id> <guild_id>
#
# С загрузкой .env:
#   set -a && source .env && set +a && ./scripts/check-members.sh <user_id> <guild_id>

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USER_ID="${1:?Usage: $0 <user_id> <guild_id>}"
GUILD_ID="${2:?Usage: $0 <user_id> <guild_id>}"

if [ -z "$DATABASE" ]; then
  if [ -f "$SCRIPT_DIR/../.env" ]; then
    set -a
    source "$SCRIPT_DIR/../.env"
    set +a
  fi
fi

if [ -z "$DATABASE" ]; then
  echo "Error: DATABASE not set. Export it or add to .env in server root."
  exit 1
fi

echo "user_id=$USER_ID guild_id=$GUILD_ID"
echo ""

psql "$DATABASE" -v user_id="$USER_ID" -v guild_id="$GUILD_ID" -f "$SCRIPT_DIR/check-members.sql"
