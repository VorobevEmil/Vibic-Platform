using UserService.Core.Entities;

namespace UserService.Application.Features.UserProfileFeatures.Common;

public static class UserProfileDTOMapper
{
    public static UserProfileDTO MapToDTO(this UserProfile userProfile)
    {
        return new UserProfileDTO(
            userProfile.Id,
            userProfile.Username,
            userProfile.AvatarUrl,
            userProfile.Bio,
            userProfile.Status);
    }
}