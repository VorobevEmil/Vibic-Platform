# NotificationService

NotificationService delivers in-app push notifications to users for new messages, friend requests, and server invites.

## Port

`7210`

## Responsibilities

- Store and retrieve per-user notifications
- Mark individual notifications or all notifications as read
- Push new notifications in real time over SignalR (`/hubs/notifications`)
- Push read-status changes over SignalR so multiple tabs/devices stay in sync
- Consume `MessageCreatedEvent`, `ServerInviteCreatedEvent`, `FriendRequestCreatedEvent`, and `FriendRequestAcceptedEvent` from RabbitMQ
- Apply EF Core migrations on startup

## Notification types

| Type | Value | Trigger |
|---|---|---|
| `FriendRequestReceived` | 0 | Another user sent a friend request; `relatedEntityId` = request ID |
| `FriendRequestAccepted` | 1 | A sent friend request was accepted |
| `NewMessage` | 2 | A new message in a direct channel or a server channel; `relatedEntityId` = channel ID |
| `ServerInviteReceived` | 3 | The user received a server invite; `relatedEntityId` = invite ID |
| `CallReceived` | 4 | An incoming call |

## Main endpoints

| Endpoint | Description |
|---|---|
| `GET /notifications` | Get notifications (`?isRead=`, `?limit=`, `?offset=`) |
| `GET /notifications/unread-count` | Get the unread notification count |
| `POST /notifications/{id}/read` | Mark one notification as read |
| `POST /notifications/read-all` | Mark all notifications as read |
| `/hubs/notifications` | SignalR notification hub |

## SignalR events

| Event | Direction | Description |
|---|---|---|
| `ReceiveNotification` | Server → Client | A new notification object |
| `NotificationsRead` | Server → Client | `null` = all read; `string[]` = IDs of notifications that were marked read |

## Dependencies

- PostgreSQL for notification data
- RabbitMQ for integration events (consumed from ChatChannelService, UserService, and OAuthServer)
- GitHub Packages for restoring `Vibic.Shared.*` packages during build and restore

## Configuration

Copy `src/NotificationService/src/NotificationService.Web/appsettings.example.json` to `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Postgres": "Host=localhost;Port=5432;Database=vibic_notifications;Username=postgres;Password=postgres",
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

| Key | Description |
|---|---|
| `ConnectionStrings:Postgres` | PostgreSQL connection string |
| `ConnectionStrings:RabbitMq` | RabbitMQ connection string |
| `Authentication:Jwt:*` | JWT settings that must match OAuthServer |
| `Authentication:Authority` | OAuth authority URL |

The notification hub reads JWT tokens from the `access_token` query parameter for WebSocket connections.

## Run

Docker:

- Included in `docker compose up --build`
- Uses `configs/appsettings.notificationservice.json`

Local:

```bash
dotnet run --project src/NotificationService/src/NotificationService.Web
```
