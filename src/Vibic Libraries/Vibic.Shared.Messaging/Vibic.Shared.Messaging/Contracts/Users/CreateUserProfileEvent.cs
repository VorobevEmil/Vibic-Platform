namespace Vibic.Shared.Messaging.Contracts.Users;

public record CreateUserProfileEvent(
    Guid UserId,
    string DisplayName,
    string Username,
    string Email
);