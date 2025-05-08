using UserService.Application.Features.FriendRequestFeatures.Common;
using UserService.Web.Models.Friends.Responses;

namespace UserService.Web.Mappings;

public static class FriendRequestMappingExtensions
{
    public static FriendRequestResponse MapToResponse(this FriendRequestDto dto)
    {
        return new FriendRequestResponse
        {
            RequestId = dto.RequestId,
            UserProfile = dto.UserProfile.MapToResponse()
        };
    }
}