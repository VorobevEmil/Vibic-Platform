using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Application.Features.UserProfileFeatures.Update;
using UserService.Web.Models.UserProfile;

namespace UserService.Web.Mappings;

public static class UserProfileMappingExtensions
{
    public static UpdateUserProfileCommand MapToCommand(this UserProfileRequest request)
    {
        return new(request.Username, request.AvatarUri, request.Bio);
    }

    public static UserProfileResponse MapToResponse(this UserProfileDTO dto)
    {
        return new UserProfileResponse()
        {
            Id = dto.Id,
            Username = dto.Username,
            AvatarUrl = dto.AvatarUrl,
            Bio = dto.Bio,
            UserStatus = dto.UserStatus
        };
    }
}