# FileService

FileService stores and retrieves files in MinIO. It currently handles user avatars and server icons.

## Port

`7205`

## Responsibilities

- Upload avatar files
- Upload server icon files
- Return stored avatar files
- Return stored server icon files
- Keep file storage concerns separate from the business services

## Main endpoints

| Endpoint | Description |
|---|---|
| `GET /files/avatars/{userId}/{fileName}` | Get an avatar file |
| `POST /files/avatars/{userId}` | Upload an avatar file |
| `GET /files/servers/{serverId}/{fileName}` | Get a server icon |
| `POST /files/servers/{serverId}` | Upload a server icon |

## Dependencies

- MinIO for S3-compatible object storage
- GitHub Packages for restoring `Vibic.Shared.*` packages during build and restore

This service does not use a database or RabbitMQ.

## Configuration

Copy `src/FileService/src/FileService.Web/appsettings.example.json` to `appsettings.json`:

```json
{
  "Minio": {
    "Endpoint": "localhost:9000",
    "AccessKey": "admin",
    "SecretKey": "admin12345"
  }
}
```

| Key | Description |
|---|---|
| `Minio:Endpoint` | MinIO API endpoint |
| `Minio:AccessKey` | MinIO access key |
| `Minio:SecretKey` | MinIO secret key |

## Run

Docker:

- Included in `docker compose up --build`
- Uses `configs/appsettings.fileservice.json`

Local:

```bash
dotnet run --project src/FileService/src/FileService.Web
```
