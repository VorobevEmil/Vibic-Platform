# MediaService

Сервис голосовых и видеозвонков с SignalR-хабом для сигнализации WebRTC.

## Порт

`7139`

## Возможности

- SignalR-хаб `/hubs/call` для WebRTC-сигнализации
- Аудио- и видеозвонки 1-на-1
- JWT-авторизация (токен передается в query string для WebSocket)
- Управление активными сессиями звонков

## Зависимости

- **OAuthServer** — для валидации JWT-токенов (одинаковые настройки `Authentication:Jwt`)

## Конфигурация

Скопируйте `appsettings.example.json` в `appsettings.json`:

```json
{
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

| Параметр               | Описание                                       |
|------------------------|------------------------------------------------|
| `Authentication:Jwt:*` | Настройки JWT (должны совпадать с OAuthServer) |

## Запуск

### Docker

Запускается автоматически через `docker-compose up --build` из корня проекта.

### Локально

```bash
dotnet run --project src/MediaService/src/MediaService.Web
```
