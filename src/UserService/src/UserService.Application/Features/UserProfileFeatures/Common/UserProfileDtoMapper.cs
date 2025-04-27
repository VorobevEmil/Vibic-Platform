using UserService.Core.Entities;

namespace UserService.Application.Features.UserProfileFeatures.Common;

public static class UserProfileDtoMapper
{
    public static UserProfileDto MapToDto(this UserProfile userProfile)
    {
        return new UserProfileDto(
            userProfile.Id,
            userProfile.DisplayName,
            userProfile.Username,
            userProfile.AvatarUrl,
            userProfile.Bio,
            userProfile.Status);
    }
}