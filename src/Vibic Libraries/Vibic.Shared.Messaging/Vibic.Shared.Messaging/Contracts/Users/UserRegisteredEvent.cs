namespace Vibic.Shared.Messaging.Contracts.Users;

public record UserRegisteredEvent(
    Guid UserId,
    string Username,
    string Email
);