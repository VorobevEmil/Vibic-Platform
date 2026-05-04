namespace Vibic.Shared.Messaging.Topology;

/// <summary>
/// Central registry of all RabbitMQ exchange and queue names.
/// Naming convention:
///   Exchanges: vibic.{domain}.{event-name}  (fanout, durable)
///   Queues:    {service-slug}.{domain}.{event-name}  (durable + DLX)
/// </summary>
public static class VibicExchanges
{
    // ── Dead Letter ──────────────────────────────────────────────────────────
    public const string DeadLetter = "vibic.dead-letter";
    public const string DeadLetterQueue = "vibic.dead-letter.queue";

    // ── User Domain ───────────────────────────────────────────────────────────
    public const string UserProfileCreated = "vibic.user.profile-created";
    public const string UserChatCreated    = "vibic.user.chat-created";
    public const string UserAvatarUpdated  = "vibic.user.avatar-updated";
    public const string FriendRequestCreated = "vibic.user.friend-request-created";
    public const string FriendRequestAccepted = "vibic.user.friend-request-accepted";

    // ── Chat Domain ────────────────────────────────────────────────────────────
    public const string MessageCreated = "vibic.chat.message-created";
    public const string ServerInviteCreated = "vibic.chat.invite-created";
}
