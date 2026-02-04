# UserService

Сервис профилей пользователей, системы друзей и аватаров.

## Порт

`7155`

## Возможности

- Управление профилями пользователей
- Система друзей: отправка, принятие, отклонение заявок
- Загрузка и обновление аватаров через FileService
- SignalR-хаб `/hubs/presence` для отслеживания онлайн-статуса
- Потребление событий из RabbitMQ (создание профиля при регистрации)
- Автоматическая миграция БД при старте

## Зависимости

- **PostgreSQL** — хранение профилей и связей (БД `vibic_users`)
- **RabbitMQ** — потребление событий (MassTransit)
- **FileService** — загрузка аватаров через HTTP

## Конфигурация

Скопируйте `appsettings.example.json` в `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Postgres": "Host=localhost;Port=5432;Database=vibic_users;Username=postgres;Password=postgres",
    "RabbitMq": "rabbitmq://rabbitmq:rabbitmq@localhost:5672/"
  },
  "Authentication": {
    "Jwt": {
      "Issuer": "Vibic",
      "Audience": "Vibic",
      "Key": "DEV_ONLY_CHANGE_ME_32_CHARS_MIN"
    },
    "Authority": "http://localhost:7154"
  },
  "FileService": {
    "Url": "http://localhost:7205"
  }
}
```

| Параметр                     | Описание                                       |
|------------------------------|------------------------------------------------|
| `ConnectionStrings:Postgres` | Строка подключения к PostgreSQL                |
| `ConnectionStrings:RabbitMq` | AMQP-строка подключения к RabbitMQ             |
| `Authentication:Jwt:*`       | Настройки JWT (должны совпадать с OAuthServer) |
| `FileService:Url`            | URL FileService для загрузки аватаров          |

## Запуск

### Docker

Запускается автоматически через `docker-compose up --build` из корня проекта. Docker-конфиг монтируется из
`configs/appsettings.userservice.json`.

### Локально

```bash
dotnet run --project src/UserService/src/UserService.Web
```
