# ChatChannelService

Сервис серверов, каналов, сообщений и чат-хаба SignalR.

## Порт

`7138`

## Возможности

- Создание и управление серверами
- Текстовые и голосовые каналы
- Отправка сообщений с курсорной пагинацией
- Приглашения на сервер по коду
- Управление участниками сервера
- SignalR-хаб `/hubs/chat` для real-time сообщений
- Потребление событий из RabbitMQ (создание чат-пользователя)
- Автоматическая миграция БД при старте

## Зависимости

- **PostgreSQL** — хранение серверов, каналов, сообщений (БД `vibic_chat`)
- **RabbitMQ** — потребление событий (MassTransit)

## Конфигурация

Скопируйте `appsettings.example.json` в `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Postgres": "Host=localhost;Port=5432;Database=vibic_chat;Username=postgres;Password=postgres",
    "RabbitMq": "rabbitmq://rabbitmq:rabbitmq@localhost:5672/"
  },
  "Authentication": {
    "Jwt": {
      "Issuer": "Vibic",
      "Audience": "Vibic",
      "Key": "DEV_ONLY_CHANGE_ME_32_CHARS_MIN"
    },
    "Authority": "http://localhost:7154"
  }
}
```

| Параметр                     | Описание                                       |
|------------------------------|------------------------------------------------|
| `ConnectionStrings:Postgres` | Строка подключения к PostgreSQL                |
| `ConnectionStrings:RabbitMq` | AMQP-строка подключения к RabbitMQ             |
| `Authentication:Jwt:*`       | Настройки JWT (должны совпадать с OAuthServer) |

## Запуск

### Docker

Запускается автоматически через `docker-compose up --build` из корня проекта. Docker-конфиг монтируется из
`configs/appsettings.chatchannelservice.json`.

### Локально

```bash
dotnet run --project src/ChatChannelService/src/ChatChannelService.Web
```
