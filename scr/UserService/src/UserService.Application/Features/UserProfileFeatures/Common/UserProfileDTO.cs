using UserService.Core.Enums;

namespace UserService.Application.Features.UserProfileFeatures.Common;

public record UserProfileDTO(
    Guid Id,
    string Username,
    string? AvatarUrl,
    string? Bio,
    UserStatus UserStatus);