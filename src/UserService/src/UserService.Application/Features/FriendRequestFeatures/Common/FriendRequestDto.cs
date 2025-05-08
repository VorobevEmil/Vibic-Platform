using UserService.Application.Features.UserProfileFeatures.Common;

namespace UserService.Application.Features.FriendRequestFeatures.Common;

public record FriendRequestDto(Guid RequestId, UserProfileDto UserProfile);