namespace Vibic.Shared.Messaging.Contracts.Users;

public record FriendRequestCreatedEvent(
    Guid RequestId,
    Guid SenderId,
    string SenderDisplayName,
    Guid ReceiverId);
