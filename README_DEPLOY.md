# Инструкция по развертыванию Spacebar Server на VPS

##  Настройка конфигурации

⚠️ **ВАЖНО**: Перед началом развертывания создайте файл конфигурации:

```bash
cp deploy.config.example deploy.config
nano deploy.config
```

Заполните все параметры в файле `deploy.config`, включая:
- URL репозитория
- Ветку для развертывания
- Директории развертывания
- Имена контейнеров

**Ветка для развертывания по умолчанию**: `vps-spacebar-fermi-test`

## Предварительные требования

1. SSH доступ к серверу
2. Установленные Docker и Docker Compose
3. Установленный Git
4. Установленный Nginx (для проксирования)

## Шаг 1: Подключение к серверу

```bash
# Используйте данные из вашей конфигурации
# Рекомендуется использовать SSH ключи вместо пароля
ssh <VPS_USER>@<VPS_IP>
# Или с SSH ключом:
ssh -i <путь_к_ssh_ключу> <VPS_USER>@<VPS_IP>
```

⚠️ **Безопасность**: 
- Используйте SSH ключи вместо паролей
- Смените пароль root после первого входа: `passwd`
- Настройте SSH ключи и отключите вход по паролю

## Шаг 2: Установка необходимого ПО

### Обновление системы
```bash
apt update && apt upgrade -y
```

### Установка Docker
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Запуск Docker
systemctl start docker
systemctl enable docker

# Проверка установки
docker --version
```

### Установка Docker Compose
```bash
apt install docker-compose -y
# или для последней версии:
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### Установка Git
```bash
apt install git -y
```

### Установка Nginx
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

## Шаг 3: Настройка репозитория и развертывание

### Создание конфигурационного файла

Создайте файл `deploy.config` на основе примера:

```bash
cd /opt/spacebar/server
cp deploy.config.example deploy.config
nano deploy.config
```

Заполните все параметры в файле.

### Клонирование репозитория
```bash
mkdir -p /opt/spacebar
cd /opt/spacebar
# URL репозитория будет взят из deploy.config
git clone <GIT_REPO из deploy.config> server
cd server
git checkout <DEPLOY_BRANCH из deploy.config>
```

### Создание конфигурационного файла

Создайте файл `config.json` в директории `/opt/spacebar/server/`:

```bash
nano /opt/spacebar/server/config.json
```

Пример конфигурации:
```json
{
  "general": {
    "apiVersion": "10",
    "instance": {
      "name": "Storytable",
      "description": "Spacebar instance on storytable.ru",
      "image": "",
      "preview": ""
    }
  },
  "database": {
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "database": "spacebar",
    "username": "spacebar",
    "password": "your_password_here"
  },
  "cdn": {
    "endpointPublic": "https://storytable.ru",
    "resize": {
      "enabled": true,
      "width": 512,
      "height": 512
    }
  },
  "gateway": {
    "endpointPublic": "wss://storytable.ru/gateway"
  },
  "security": {
    "jwtSecret": "generate_random_secret_here",
    "forwardedIp": true
  }
}
```

**Важно**: 
- Сгенерируйте случайный `jwtSecret` (можно использовать `openssl rand -hex 32`)
- Настройте базу данных PostgreSQL (см. Шаг 4)

### Настройка прав на скрипт развертывания
```bash
chmod +x /opt/spacebar/server/deploy.sh
```

### Запуск развертывания
```bash
cd /opt/spacebar/server
./deploy.sh vps-spacebar-fermi-test
```

## Шаг 4: Настройка базы данных PostgreSQL

### Установка PostgreSQL
```bash
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql
```

### Создание базы данных и пользователя
```bash
sudo -u postgres psql
```

В консоли PostgreSQL выполните:
```sql
CREATE DATABASE spacebar;
CREATE USER spacebar WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE spacebar TO spacebar;
ALTER DATABASE spacebar OWNER TO spacebar;
\q
```

Обновите `config.json` с правильными данными для подключения к БД.

### Настройка доступа PostgreSQL из Docker контейнера

PostgreSQL должен разрешать подключения из Docker сети. Выполните:

```bash
# Определите IP адрес Docker bridge (обычно 172.17.0.1)
ip addr show docker0 | grep "inet " | awk '{print $2}' | cut -d/ -f1

# Отредактируйте pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Добавьте строку в конец файла (замените `172.17.0.0/16` на вашу Docker сеть, если отличается):

```
host    all             all             172.17.0.0/16          scram-sha-256
```

Или для всех Docker сетей (более широкий диапазон):

```
host    all             all             172.16.0.0/12          scram-sha-256
```

Перезапустите PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### Настройка переменной DATABASE в docker-compose.vps.yml

Отредактируйте `docker-compose.vps.yml` и добавьте переменную `DATABASE`:

```bash
cd /opt/spacebar/server
nano docker-compose.vps.yml
```

Добавьте в секцию `environment`:

```yaml
environment:
  - PORT=3001
  - CONFIG_PATH=/spacebar/config.json
  - CONFIG_READONLY=true
  - DATABASE=postgres://spacebar:your_password@172.17.0.1:5432/spacebar
```

**Важно:**
- Замените `your_password` на реальный пароль из PostgreSQL
- Замените `172.17.0.1` на IP Docker bridge (см. команду выше)
- Если PostgreSQL на том же хосте, используйте `172.17.0.1` или `host.docker.internal` (на Linux может не работать)
- Альтернатива: используйте `network_mode: "host"` в docker-compose и `localhost:5432` в DATABASE

## Шаг 5: Настройка Nginx

### Копирование конфигурации

Перед копированием обновите `nginx.vps.conf` с вашим доменом, затем:

```bash
# Замените <VPS_DOMAIN> на ваш домен
cp /opt/spacebar/server/nginx.vps.conf /etc/nginx/sites-available/<VPS_DOMAIN>
ln -s /etc/nginx/sites-available/<VPS_DOMAIN> /etc/nginx/sites-enabled/
```

### Удаление дефолтной конфигурации (опционально)
```bash
rm /etc/nginx/sites-enabled/default
```

### Проверка конфигурации
```bash
nginx -t
```

### Перезапуск Nginx
```bash
systemctl restart nginx
```

## Шаг 6: Настройка SSL сертификата (Let's Encrypt)

### Установка Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### Получение сертификата
```bash
# Замените <VPS_DOMAIN> на ваш домен
certbot --nginx -d <VPS_DOMAIN> -d www.<VPS_DOMAIN>
```

Следуйте инструкциям на экране. Certbot автоматически обновит конфигурацию Nginx.

### Автоматическое обновление сертификата
```bash
certbot renew --dry-run
```

## Шаг 7: Настройка файрвола

```bash
# Установка UFW (если не установлен)
apt install ufw -y

# Разрешить SSH
ufw allow 22/tcp

# Разрешить HTTP и HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Включить файрвол
ufw enable

# Проверить статус
ufw status
```

## Шаг 8: Проверка работы

1. Проверьте статус контейнера:
```bash
docker ps | grep spacebar-server
```

2. Проверьте логи:
```bash
docker logs spacebar-server --tail 50
```

3. Проверьте доступность через браузер:
   - Откройте `https://<VPS_DOMAIN>` в браузере (замените на ваш домен)

## Обновление развертывания

Для обновления до последней версии из ветки `vps-spacebar-fermi-test`:

```bash
cd /opt/spacebar/server
./deploy.sh vps-spacebar-fermi-test
```

## Полезные команды

### Просмотр логов
```bash
docker logs spacebar-server -f
```

### Перезапуск сервера
```bash
docker restart spacebar-server
```

### Остановка сервера
```bash
docker stop spacebar-server
```

### Просмотр статуса
```bash
docker ps -a | grep spacebar
```

### Бэкап базы данных
```bash
docker exec spacebar-server cat /spacebar/database.db > /opt/spacebar-backups/db-$(date +%Y%m%d).db
```

## Устранение неполадок

### Контейнер не запускается
```bash
# Проверьте логи
docker logs spacebar-server

# Проверьте конфигурацию
cat /opt/spacebar/server/config.json
```

### Проблемы с подключением к базе данных
```bash
# Проверьте статус PostgreSQL
systemctl status postgresql

# Проверьте подключение
sudo -u postgres psql -c "SELECT 1;"
```

### Проблемы с Nginx
```bash
# Проверьте конфигурацию
nginx -t

# Проверьте логи
tail -f /var/log/nginx/storytable-error.log
```

## Безопасность

⚠️ **ВАЖНО**: После первого входа обязательно:
1. Смените пароль root: `passwd`
2. Настройте SSH ключи вместо пароля
3. Отключите вход по паролю в `/etc/ssh/sshd_config`
4. Используйте сильные пароли для базы данных
5. Регулярно обновляйте систему: `apt update && apt upgrade`
