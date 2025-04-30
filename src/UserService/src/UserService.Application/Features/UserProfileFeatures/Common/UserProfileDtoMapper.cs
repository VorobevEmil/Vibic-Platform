using Microsoft.AspNetCore.Http;
using UserService.Application.Helpers;
using UserService.Core.Entities;

namespace UserService.Application.Features.UserProfileFeatures.Common;

public static class UserProfileDtoMapper
{
    public static UserProfileDto MapToDto(this UserProfile userProfile, HttpRequest request)
    {
        string? avatarUrl = userProfile.AvatarUrl;

        if (!string.IsNullOrWhiteSpace(avatarUrl))
        {
            avatarUrl = request.GetAbsoluteUrl(avatarUrl);
        }
        
        return new UserProfileDto(
            userProfile.Id,
            userProfile.DisplayName,
            userProfile.Username,
            avatarUrl,
            userProfile.Bio,
            userProfile.Status);
    }
}