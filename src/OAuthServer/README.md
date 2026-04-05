# OAuthServer

OAuthServer handles user registration, sign-in, JWT issuance, and OpenIddict endpoints for the Vibic platform.

## Port

`7154`

## Responsibilities

- Register users
- Sign users in and return JWT access tokens
- Expose OpenIddict endpoints for authorization, token exchange, and user info
- Manage OpenIddict applications through protected settings endpoints
- Publish user-created events to RabbitMQ
- Apply EF Core migrations on startup

## Main endpoints

| Endpoint | Description |
|---|---|
| `POST /auth/sign-in` | Sign in and return an access token |
| `POST /auth/sign-up` | Register a new user |
| `POST /auth/logout` | Sign out the current user |
| `GET /connect/authorize` | OpenIddict authorize endpoint |
| `POST /connect/token` | OpenIddict token endpoint |
| `GET/POST /connect/userinfo` | OpenIddict user info endpoint |
| `GET /settings/applications` | List configured applications |
| `GET /settings/applications/{id}` | Get one application |
| `POST /settings/applications` | Create an application |
| `PUT /settings/applications/{id}` | Update an application |
| `DELETE /settings/applications/{id}` | Delete an application |

Only `/auth/sign-in` and `/auth/sign-up` are currently proxied through ApiGateway.

## Dependencies

- PostgreSQL for users and OpenIddict data
- RabbitMQ for outbound events
- GitHub Packages for restoring `Vibic.Shared.*` packages during build and restore

## Configuration

Copy `src/OAuthServer/src/OAuthServer.Web/appsettings.example.json` to `appsettings.json`:

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

| Key | Description |
|---|---|
| `ConnectionStrings:Postgres` | PostgreSQL connection string |
| `ConnectionStrings:RabbitMq` | RabbitMQ connection string |
| `Authentication:Jwt:Issuer` | JWT issuer |
| `Authentication:Jwt:Audience` | JWT audience |
| `Authentication:Jwt:Key` | JWT signing key, minimum 32 characters |
| `Authentication:Authority` | OAuth/OpenIddict authority URL |

## Run

Docker:

- Included in `docker compose up --build`
- Uses `configs/appsettings.oauthserver.json`

Local:

```bash
dotnet run --project src/OAuthServer/src/OAuthServer.Web
```
