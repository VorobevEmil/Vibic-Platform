using UserService.Web.Models.UserProfile;

namespace UserService.Web.Models.Friends.Responses;

public class FriendRequestResponse
{
    public required Guid RequestId { get; init; }
    public required UserProfileResponse UserProfile { get; init; }
}