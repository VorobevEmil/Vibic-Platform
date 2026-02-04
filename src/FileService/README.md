# FileService

Сервис загрузки и хранения файлов в MinIO (S3-совместимое хранилище).

## Порт

`7205`

## Возможности

- Загрузка файлов (аватары, вложения)
- Получение файлов по идентификатору
- Хранение в MinIO с S3 API

## Зависимости

- **MinIO** — S3-совместимое объектное хранилище

## Конфигурация

Скопируйте `appsettings.example.json` в `appsettings.json`:

```json
{
  "Minio": {
    "Endpoint": "localhost:9000",
    "AccessKey": "admin",
    "SecretKey": "admin12345"
  }
}
```

| Параметр          | Описание             |
|-------------------|----------------------|
| `Minio:Endpoint`  | Адрес MinIO API      |
| `Minio:AccessKey` | Ключ доступа MinIO   |
| `Minio:SecretKey` | Секретный ключ MinIO |

## Запуск

### Docker

Запускается автоматически через `docker-compose up --build` из корня проекта. Docker-конфиг монтируется из
`configs/appsettings.fileservice.json`.

### Локально

```bash
dotnet run --project src/FileService/src/FileService.Web
```
