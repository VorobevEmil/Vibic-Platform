# UserService

UserService manages user profiles, avatar updates, friendship workflows, and the presence SignalR hub.

## Port

`7155`

## Responsibilities

- Read and update user profiles
- Search users by username
- Update user avatars through FileService
- Manage friend requests and friend lists
- Expose the `/hubs/presence` SignalR hub
- Consume user-created events from RabbitMQ
- Publish avatar-updated events to RabbitMQ
- Apply EF Core migrations on startup

## Main endpoints

| Endpoint | Description |
|---|---|
| `GET /user-profiles/me` | Get the current user's profile |
| `GET /user-profiles/{id}` | Get a user profile by id |
| `GET /user-profiles/search?search=...` | Search users by username |
| `PATCH /user-profiles` | Update profile fields |
| `PATCH /user-profiles/avatar` | Upload a new avatar |
| `PATCH /user-profiles/user-status/{userStatus}` | Update online status |
| `GET /user-profiles/avatar/{userId}/{fileName}` | Proxy an avatar image from FileService |
| `GET /friends` | Get the current user's friends |
| `POST /friends/request/{receiverId}` | Send a friend request |
| `POST /friends/accept/{requestId}` | Accept a friend request |
| `POST /friends/reject/{requestId}` | Reject a friend request |
| `GET /friends/requests/incoming` | Get incoming requests |
| `GET /friends/requests/outgoing` | Get outgoing requests |
| `/hubs/presence` | Presence hub |

ApiGateway currently proxies `/user-profiles/*` and `/friends*`, but not `/hubs/presence`.

## Dependencies

- PostgreSQL for user data
- RabbitMQ for integration events
- FileService for avatar storage
- GitHub Packages for restoring `Vibic.Shared.*` packages during build and restore

## Configuration

Copy `src/UserService/src/UserService.Web/appsettings.example.json` to `appsettings.json`:

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

| Key | Description |
|---|---|
| `ConnectionStrings:Postgres` | PostgreSQL connection string |
| `ConnectionStrings:RabbitMq` | RabbitMQ connection string |
| `Authentication:Jwt:*` | JWT settings that must match OAuthServer |
| `Authentication:Authority` | OAuth authority URL |
| `FileService:Url` | Base URL of FileService |

## Run

Docker:

- Included in `docker compose up --build`
- Uses `configs/appsettings.userservice.json`

Local:

```bash
dotnet run --project src/UserService/src/UserService.Web
```
