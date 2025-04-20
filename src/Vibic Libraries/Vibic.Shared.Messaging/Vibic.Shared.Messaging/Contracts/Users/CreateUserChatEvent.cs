namespace Vibic.Shared.Messaging.Contracts.Users;

public record CreateUserChatEvent(
    Guid UserId,
    string Username,
    string AvatarUrl);