namespace Vibic.Shared.Messaging.Contracts.Users;

public record  UpdateUserAvatarEvent(Guid UserId, string AvatarUrl);