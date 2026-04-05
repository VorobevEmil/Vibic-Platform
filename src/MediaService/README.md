# MediaService

MediaService provides the SignalR call hub used for direct calls and for tracking users inside server voice channels.

## Port

`7139`

## Responsibilities

- Expose `/hubs/call` for real-time call signaling
- Handle direct 1-to-1 audio/video call flows
- Manage WebRTC offer, answer, and ICE candidate exchange
- Track server voice-channel membership
- Broadcast voice-channel join and leave events
- Validate JWT access tokens for hub connections

## Hub capabilities

The `CallHub` currently supports:

- direct call events such as `CallUser`, `AcceptCall`, `RejectCall`, and `CancelCall`
- WebRTC signaling with `SendOffer`, `SendAnswer`, and `SendIceCandidate`
- voice-channel presence with `JoinServer`, `LeaveServer`, `JoinVoiceChannel`, `LeaveVoiceChannel`, and `GetVoiceUsers`

## Dependencies

- JWT configuration compatible with OAuthServer
- GitHub Packages for restoring `Vibic.Shared.*` packages during build and restore

This service does not currently persist data in PostgreSQL or publish/consume RabbitMQ messages.

## Configuration

Copy `src/MediaService/src/MediaService.Web/appsettings.example.json` to `appsettings.json`:

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

| Key | Description |
|---|---|
| `Authentication:Jwt:*` | JWT settings that must match OAuthServer |
| `Authentication:Authority` | OAuth authority URL |

Like `ChatChannelService`, the hub reads the JWT from the `access_token` query parameter for WebSocket connections.

## Run

Docker:

- Included in `docker compose up --build`

Local:

```bash
dotnet run --project src/MediaService/src/MediaService.Web
```
