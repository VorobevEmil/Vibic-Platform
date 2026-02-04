# Vibic Platform

Платформа для общения с серверами, текстовыми и голосовыми каналами, видеозвонками и системой друзей. Построена на
микросервисной архитектуре с .NET 10, React 19 и SignalR.

## Архитектура

```
vibic-frontend (React)
       |
   ApiGateway (Ocelot, :7157)
       |
  +---------+-----------+-----------+-----------+
  |         |           |           |           |
OAuthServer UserService ChatChannel MediaService FileService
  (:7154)   (:7155)     Service     (:7139)     (:7205)
  |         |           (:7138)     |           |
  |         |           |           |           MinIO
  Postgres  Postgres    Postgres    |
  RabbitMQ  RabbitMQ    RabbitMQ    |
            FileService             |
```

### Состав проекта

| Компонент          | Путь                     | Описание                                     |
|--------------------|--------------------------|----------------------------------------------|
| Frontend           | `src/vibic-frontend`     | React 19 + TypeScript + Vite                 |
| ApiGateway         | `src/ApiGateway`         | Ocelot API Gateway                           |
| OAuthServer        | `src/OAuthServer`        | OAuth 2.0 / OpenIddict, JWT                  |
| UserService        | `src/UserService`        | Профили, друзья, аватары                     |
| ChatChannelService | `src/ChatChannelService` | Серверы, каналы, сообщения, чат-хаб          |
| MediaService       | `src/MediaService`       | Звонки, SignalR-хаб                          |
| FileService        | `src/FileService`        | Загрузка файлов, MinIO                       |
| Vibic Libraries    | `src/Vibic Libraries`    | Общие NuGet-библиотеки (Core, EF, Messaging) |

### Маршрутизация (ApiGateway)

| Маршрут            | Сервис                       |
|--------------------|------------------------------|
| `/auth/*`          | OAuthServer                  |
| `/servers/*`       | ChatChannelService           |
| `/user-profiles/*` | UserService                  |
| `/files/*`         | FileService                  |
| `/hubs/chat`       | ChatChannelService (SignalR) |
| `/hubs/call`       | MediaService (SignalR)       |

### Инфраструктурные зависимости

- **PostgreSQL 13** — базы данных для OAuthServer, UserService, ChatChannelService
- **RabbitMQ** — межсервисная коммуникация (MassTransit)
- **MinIO** — S3-совместимое хранилище файлов

## Запуск через Docker

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd Vibic-Platform
```

### 2. Запустить все сервисы

```bash
docker-compose up --build
```

Эта команда поднимет:

- React-фронтенд (nginx, порт 3000)
- 6 микросервисов (.NET)
- PostgreSQL, RabbitMQ, MinIO
- Все в единой Docker-сети `my_network`

### 3. Настройка

Docker-конфиги для сервисов лежат в `configs/` и монтируются автоматически через `docker-compose.yml`:

```
configs/
├── appsettings.chatchannelservice.json
├── appsettings.fileservice.json
├── appsettings.oauthserver.json
└── appsettings.userservice.json
```

ApiGateway использует `ocelot.Docker.json` (переключается через `ASPNETCORE_ENVIRONMENT=Docker`).

MediaService не требует конфигурационного файла в Docker (JWT-конфигурация нужна только при локальном запуске).

Фронтенд собирается в Docker с `VITE_API_BASE_URL=http://localhost:7157` (можно переопределить через `build.args` в
`docker-compose.yml`).

### 4. Проверить работоспособность

После запуска доступны:

| Сервис        | URL                                        |
|---------------|--------------------------------------------|
| Frontend      | http://localhost:3000                      |
| ApiGateway    | http://localhost:7157                      |
| RabbitMQ UI   | http://localhost:15672 (rabbitmq/rabbitmq) |
| MinIO Console | http://localhost:9001 (admin/admin12345)   |
| PostgreSQL    | localhost:5432 (postgres/postgres)         |

## Локальный запуск (без Docker)

### 1. Поднять инфраструктуру

Запустите PostgreSQL, RabbitMQ и MinIO локально или через Docker:

```bash
docker-compose up postgres rabbitmq minio
```

### 2. Настроить конфигурации

В каждом сервисе скопируйте `appsettings.example.json` в `appsettings.json` и подставьте свои значения. Примеры конфигов
есть в README каждого сервиса.

### 3. Запустить сервисы

```bash
dotnet run --project src/OAuthServer/src/OAuthServer.Web
dotnet run --project src/UserService/src/UserService.Web
dotnet run --project src/ChatChannelService/src/ChatChannelService.Web
dotnet run --project src/FileService/src/FileService.Web
dotnet run --project src/MediaService/src/MediaService.Web
dotnet run --project src/ApiGateway/src/ApiGateway.Web
```

### 4. Запустить фронтенд

```bash
cd src/vibic-frontend
npm install
npm run dev
```

## Порты

| Сервис             | Порт  |
|--------------------|-------|
| Frontend (Docker)  | 3000  |
| ApiGateway         | 7157  |
| OAuthServer        | 7154  |
| UserService        | 7155  |
| ChatChannelService | 7138  |
| MediaService       | 7139  |
| FileService        | 7205  |
| PostgreSQL         | 5432  |
| RabbitMQ (AMQP)    | 5672  |
| RabbitMQ (UI)      | 15672 |
| MinIO (API)        | 9000  |
| MinIO (Console)    | 9001  |

## Общие библиотеки (Vibic Libraries)

Три NuGet-пакета, опубликованные в GitHub Packages:

| Пакет                    | Описание                                                         |
|--------------------------|------------------------------------------------------------------|
| `Vibic.Shared.Core`      | IAppOptions, JWT-аутентификация, обработка ошибок, health checks |
| `Vibic.Shared.EF`        | DbContext, миграции, UnitOfWork, soft delete                     |
| `Vibic.Shared.Messaging` | RabbitMQ + MassTransit, контракты событий                        |

Все библиотеки используют паттерн `IAppOptions` + `AddOptionsWithValidateAndBind` для типизированной конфигурации с
валидацией при старте.

## Переменные окружения (docker-compose)

| Переменная          | По умолчанию | Описание                |
|---------------------|--------------|-------------------------|
| `PG_USER`           | postgres     | Пользователь PostgreSQL |
| `PG_PASS`           | postgres     | Пароль PostgreSQL       |
| `DB_NAME`           | postgres     | Имя БД PostgreSQL       |
| `RABBITMQ_USERNAME` | rabbitmq     | Пользователь RabbitMQ   |
| `RABBITMQ_PASSWORD` | rabbitmq     | Пароль RabbitMQ         |
| `MINIO_USER`        | admin        | Пользователь MinIO      |
| `MINIO_PASS`        | admin12345   | Пароль MinIO            |
