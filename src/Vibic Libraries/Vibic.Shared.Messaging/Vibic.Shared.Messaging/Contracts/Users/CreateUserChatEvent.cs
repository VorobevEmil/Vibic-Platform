namespace Vibic.Shared.Messaging.Contracts.Users;

public record CreateUserChatEvent(
    Guid UserId,
    string DisplayName,
    string Username,
    string AvatarUrl);