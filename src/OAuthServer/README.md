# OAuthServer

OAuth 2.0 / OpenIddict сервер аутентификации. Управляет регистрацией пользователей, аутентификацией и выдачей
JWT-токенов.

## Порт

`7154`

## Возможности

- Регистрация и аутентификация пользователей
- Выдача и обновление JWT-токенов через OpenIddict
- Публикация событий в RabbitMQ при создании пользователя
- Автоматическая миграция БД при старте

## Зависимости

- **PostgreSQL** — хранение пользователей и OpenIddict-данных (БД `vibic_oauth`)
- **RabbitMQ** — публикация событий (MassTransit)

## Конфигурация

Скопируйте `appsettings.example.json` в `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Postgres": "Host=localhost;Port=5432;Database=vibic_oauth;Username=postgres;Password=postgres",
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

| Параметр                      | Описание                                            |
|-------------------------------|-----------------------------------------------------|
| `ConnectionStrings:Postgres`  | Строка подключения к PostgreSQL                     |
| `ConnectionStrings:RabbitMq`  | AMQP-строка подключения к RabbitMQ                  |
| `Authentication:Jwt:Key`      | Секретный ключ для подписи JWT (минимум 32 символа) |
| `Authentication:Jwt:Issuer`   | Издатель токена                                     |
| `Authentication:Jwt:Audience` | Аудитория токена                                    |
| `Authentication:Authority`    | URL OpenIddict Authority                            |

## Запуск

### Docker

Запускается автоматически через `docker-compose up --build` из корня проекта. Docker-конфиг монтируется из
`configs/appsettings.oauthserver.json`.

### Локально

```bash
dotnet run --project src/OAuthServer/src/OAuthServer.Web
```
