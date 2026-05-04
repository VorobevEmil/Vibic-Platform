namespace Vibic.Shared.Messaging.Contracts.Users;

public record FriendRequestAcceptedEvent(
    Guid RequestId,
    Guid SenderId,
    Guid AcceptorId,
    string AcceptorDisplayName,
    Guid FriendId);
