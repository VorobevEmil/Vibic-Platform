# ApiGateway

API-шлюз на базе Ocelot. Единая точка входа для фронтенда, проксирует HTTP-запросы и SignalR-подключения в микросервисы.

## Порт

`7157`

## Маршрутизация

| Upstream           | Downstream              | Сервис                     |
|--------------------|-------------------------|----------------------------|
| `/auth/sign-in`    | OAuthServer:7154        | Вход                       |
| `/auth/sign-up`    | OAuthServer:7154        | Регистрация                |
| `/servers/*`       | ChatChannelService:7138 | Серверы, каналы, сообщения |
| `/user-profiles/*` | UserService:7155        | Профили, друзья            |
| `/files/*`         | FileService:7205        | Загрузка файлов            |
| `/hubs/chat`       | ChatChannelService:7138 | SignalR чат-хаб            |
| `/hubs/call`       | MediaService:7139       | SignalR хаб звонков        |

## Конфигурация

Два файла маршрутов:

- `ocelot.json` — для локального запуска (хосты = `localhost`)
- `ocelot.Docker.json` — для Docker (хосты = имена сервисов)

Переключение через `ASPNETCORE_ENVIRONMENT`:

- `Development` (по умолчанию) — используется `ocelot.json`
- `Docker` — используется `ocelot.Docker.json`

`appsettings.example.json`:

```json
{
  "AllowedHosts": "*"
}
```

## Запуск

### Docker

Запускается автоматически через `docker-compose up --build` из корня проекта.

### Локально

```bash
dotnet run --project src/ApiGateway/src/ApiGateway.Web
```
