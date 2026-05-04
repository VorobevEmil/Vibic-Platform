namespace Vibic.Shared.Messaging.Contracts.Chat;

public record MessageCreatedEvent(
    Guid MessageId,
    Guid ChannelId,
    Guid SenderId,
    string SenderDisplayName,
    IReadOnlyList<Guid> ReceiverIds,
    string Content);
