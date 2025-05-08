using Microsoft.AspNetCore.Http;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Core.Entities;

namespace UserService.Application.Features.FriendRequestFeatures.Common;

public static class FriendRequestDtoMapper
{
    public static FriendRequestDto MapToDto(
        this FriendRequest friendRequest, 
        UserProfile userProfile,
        HttpRequest request)
    {
        return new FriendRequestDto(friendRequest.Id, userProfile.MapToDto(request));
    }
}