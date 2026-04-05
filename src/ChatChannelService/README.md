# ChatChannelService

ChatChannelService manages servers, direct channels, server channels, invite flows, paginated messages, and the SignalR chat hub.

## Port

`7138`

## Responsibilities

- Create and delete servers
- Create direct channels
- Create server channels
- Read direct and server-channel messages with cursor pagination
- Create and resolve invite links
- Expose the `/hubs/chat` SignalR hub
- Consume user-created and avatar-updated events from RabbitMQ
- Upload server icons through FileService
- Build user avatar URLs from UserService
- Apply EF Core migrations on startup

## Main endpoints

| Endpoint | Description |
|---|---|
| `GET /servers/mine` | Get all servers for the current user |
| `GET /servers/{id}` | Get full server details |
| `POST /servers` | Create a server |
| `DELETE /servers/{id}` | Delete a server |
| `POST /servers/{serverId}/invites` | Create an invite for a server |
| `GET /channels/direct` | List direct channels |
| `GET /channels/direct/{id}` | Get one direct channel |
| `POST /channels/direct` | Create a direct channel |
| `POST /servers/{serverId}/channels` | Create a server channel |
| `GET /channels/{channelId}/messages` | Get direct-channel messages |
| `GET /servers/{serverId}/channels/{channelId}/messages` | Get server-channel messages |
| `GET /invites/{inviteCode}` | Resolve invite metadata |
| `POST /invites/{inviteCode}` | Join a server by invite |
| `/hubs/chat` | SignalR chat hub |

## Dependencies

- PostgreSQL for chat data
- RabbitMQ for integration events
- FileService for server icon uploads
- UserService for absolute avatar URLs in chat responses
- GitHub Packages for restoring `Vibic.Shared.*` packages during build and restore

## Configuration

Copy `src/ChatChannelService/src/ChatChannelService.Web/appsettings.example.json` to `appsettings.json`:

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
  },
  "FileService": {
    "Url": "http://localhost:7205"
  },
  "UserService": {
    "Url": "http://localhost:7155"
  }
}
```

| Key | Description |
|---|---|
| `ConnectionStrings:Postgres` | PostgreSQL connection string |
| `ConnectionStrings:RabbitMq` | RabbitMQ connection string |
| `Authentication:Jwt:*` | JWT settings that must match OAuthServer |
| `Authentication:Authority` | OAuth authority URL |
| `FileService:Url` | Base URL of FileService |
| `UserService:Url` | Base URL used to build avatar links |

The chat hub reads JWT tokens from the `access_token` query parameter for WebSocket connections.

## Run

Docker:

- Included in `docker compose up --build`
- Uses `configs/appsettings.chatchannelservice.json`

Local:

```bash
dotnet run --project src/ChatChannelService/src/ChatChannelService.Web
```
