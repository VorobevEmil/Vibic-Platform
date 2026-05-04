namespace Vibic.Shared.Messaging.Contracts.Chat;

public record ServerInviteCreatedEvent(
    Guid InviteId,
    Guid ServerId,
    Guid SenderId,
    Guid ReceiverId,
    string ServerName);
