using UserService.Core.Enums;

namespace UserService.Application.Features.UserProfileFeatures.Common;

public record UserProfileDto(
    Guid Id,
    string DisplayName,
    string Username,
    string? AvatarUrl,
    string? Bio,
    UserStatus UserStatus);