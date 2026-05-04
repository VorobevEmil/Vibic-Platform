# ApiGateway

ApiGateway is the Ocelot-based entry point used by the frontend. It forwards REST requests and SignalR connections to the backend services.

## Port

`7157`

## Routed endpoints

| Upstream route | Downstream service |
|---|---|
| `/auth/sign-in` | OAuthServer (`7154`) |
| `/auth/sign-up` | OAuthServer (`7154`) |
| `/servers/*` | ChatChannelService (`7138`) |
| `/channels/*` | ChatChannelService (`7138`) |
| `/messages/*` | ChatChannelService (`7138`) |
| `/invites/*` | ChatChannelService (`7138`) |
| `/user-profiles/*` | UserService (`7155`) |
| `/friends*` | UserService (`7155`) |
| `/files/*` | FileService (`7205`) |
| `/notifications/*` | NotificationService (`7210`) |
| `/hubs/chat` | ChatChannelService (`7138`) |
| `/hubs/call` | MediaService (`7139`) |
| `/hubs/presence` | UserService (`7155`) |
| `/hubs/notifications` | NotificationService (`7210`) |

Not proxied at the moment:

- OAuthServer `/connect/*`
- OAuthServer `/settings/applications`

## Configuration

Two Ocelot route files are used:

- `src/ApiGateway/src/ApiGateway.Web/ocelot.json` for local development
- `src/ApiGateway/src/ApiGateway.Web/ocelot.Docker.json` for Docker

Switching is controlled by `ASPNETCORE_ENVIRONMENT`:

- `Development` uses `ocelot.json`
- `Docker` uses `ocelot.Docker.json`

`appsettings.example.json` only contains the default host configuration:

```json
{
  "AllowedHosts": "*"
}
```

## Run

Docker:

```bash
docker compose up --build apigateway
```

Local:

```bash
dotnet run --project src/ApiGateway/src/ApiGateway.Web
```
