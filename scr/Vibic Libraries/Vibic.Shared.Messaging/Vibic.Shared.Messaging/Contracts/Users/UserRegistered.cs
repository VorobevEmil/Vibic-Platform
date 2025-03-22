namespace Vibic.Shared.Messaging.Contracts.Users;

public record UserRegistered(
    Guid UserId,
    string Username,
    string Email
);