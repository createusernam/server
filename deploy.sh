#!/bin/bash

# Скрипт развертывания Spacebar Server на VPS
# Использование: ./deploy.sh [branch]
#
# Перед использованием создайте файл deploy.config на основе deploy.config.example
# cp deploy.config.example deploy.config
# nano deploy.config

set -e

# Загружаем конфигурацию если она существует
if [ -f "deploy.config" ]; then
    source deploy.config
fi

# Параметры  по умолчанию
BRANCH="${1:-${DEPLOY_BRANCH:-vps-spacebar-fermi-test}}"
GIT_REPO="${GIT_REPO:-https://github.com/createusernam/server.git}"
REPO_DIR="/opt/spacebar"
SERVER_DIR="${DEPLOY_DIR:-$REPO_DIR/server}"
BACKUP_DIR="${BACKUP_DIR:-/opt/spacebar-backups}"
CONTAINER_NAME="${CONTAINER_NAME:-spacebar-server}"
IMAGE_NAME="${IMAGE_NAME:-spacebar-server}"

echo "🚀 Начинаем развертывание Spacebar Server из ветки: $BRANCH"

# Создаем директории если их нет
mkdir -p "$REPO_DIR" "$BACKUP_DIR" "$SERVER_DIR"

# Переходим в директорию репозитория
if [ ! -d "$SERVER_DIR/.git" ]; then
    echo "📦 Клонируем репозиторий..."
    cd "$REPO_DIR"
    git clone "$GIT_REPO" server-temp
    # Создаем целевую директорию если её нет
    mkdir -p "$SERVER_DIR"
    # Перемещаем файлы
    mv server-temp/* server-temp/.git "$SERVER_DIR/" 2>/dev/null || true
    rm -rf server-temp
else
    echo "📥 Обновляем репозиторий..."
    cd "$SERVER_DIR"
    git fetch origin
fi

cd "$SERVER_DIR"

# Переключаемся на нужную ветку
echo "🔀 Переключаемся на ветку $BRANCH..."
git checkout "$BRANCH" || git checkout -b "$BRANCH" origin/"$BRANCH"
git pull origin "$BRANCH" || true

# Создаем бэкап текущей версии если она запущена
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "💾 Создаем бэкап..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    docker cp "$CONTAINER_NAME:/spacebar/config.json" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true
    # database.db бэкап только для SQLite (не используется с PostgreSQL)
    docker cp "$CONTAINER_NAME:/spacebar/database.db" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true
fi

# Сохраняем DATABASE из текущего docker-compose.vps.yml или .env (если есть)
SAVED_DATABASE=""
if [ -f "docker-compose.vps.yml" ]; then
    EXISTING_DATABASE=$(grep -E "^\s+- DATABASE=" docker-compose.vps.yml | head -1 | sed 's/.*DATABASE=//' | sed 's/#.*//' | xargs)
    if [ -n "$EXISTING_DATABASE" ]; then
        echo "💾 Сохраняем DATABASE из текущего docker-compose.vps.yml..."
        SAVED_DATABASE="$EXISTING_DATABASE"
    fi
fi
# Проверяем .env файл
if [ -z "$SAVED_DATABASE" ] && [ -f ".env" ]; then
    EXISTING_DATABASE=$(grep "^DATABASE=" .env | head -1 | sed 's/^DATABASE=//' | xargs)
    if [ -n "$EXISTING_DATABASE" ]; then
        echo "💾 Сохраняем DATABASE из .env файла..."
        SAVED_DATABASE="$EXISTING_DATABASE"
    fi
fi

# Останавливаем старые контейнеры
echo "🛑 Останавливаем старые контейнеры..."
docker-compose -f docker-compose.vps.yml down || true
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Восстанавливаем DATABASE в .env файле (приоритет) или docker-compose.vps.yml
if [ -n "$SAVED_DATABASE" ]; then
    echo "💾 Восстанавливаем DATABASE..."
    
    # Автоматически заменяем localhost на 172.17.0.1 для подключения из Docker контейнера
    # (на Ubuntu нет host.docker.internal, поэтому используем IP Docker bridge)
    FIXED_DATABASE=$(echo "$SAVED_DATABASE" | sed 's|@localhost:5432|@172.17.0.1:5432|g')
    if [ "$SAVED_DATABASE" != "$FIXED_DATABASE" ]; then
        echo "🔧 Исправляем адрес подключения: localhost -> 172.17.0.1"
        SAVED_DATABASE="$FIXED_DATABASE"
    fi
    
    # Сначала пытаемся в .env (если используется env_file)
    if [ -f "docker-compose.vps.yml" ] && grep -q "env_file:" docker-compose.vps.yml; then
        echo "DATABASE=$SAVED_DATABASE" > .env
        echo "✅ DATABASE восстановлена в .env файле"
    # Иначе добавляем в docker-compose.vps.yml
    elif [ -f "docker-compose.vps.yml" ] && ! grep -q "^\s+- DATABASE=" docker-compose.vps.yml; then
        sed -i "/# Пример: - DATABASE=/a\      - DATABASE=$SAVED_DATABASE" docker-compose.vps.yml
        echo "✅ DATABASE восстановлена в docker-compose.vps.yml"
    fi
fi

# Собираем новый образ
echo "🔨 Собираем Docker образ..."
docker build -t "${IMAGE_NAME}:latest" .

# Запускаем контейнер
echo "▶️  Запускаем контейнер..."
docker-compose -f docker-compose.vps.yml up -d

# Ждем запуска
echo "⏳ Ждем запуска сервера..."
sleep 10

# Проверяем статус
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✅ Развертывание завершено успешно!"
    echo "📊 Статус контейнера:"
    docker ps | grep "$CONTAINER_NAME"
else
    echo "❌ Ошибка: контейнер не запущен"
    echo "📋 Логи:"
    docker logs "$CONTAINER_NAME" --tail 50
    exit 1
fi
