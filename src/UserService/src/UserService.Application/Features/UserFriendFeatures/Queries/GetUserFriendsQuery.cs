using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Extensions;

namespace UserService.Application.Features.UserFriendFeatures.Queries;

public record GetUserFriendsQuery() : IRequest<List<UserProfileDto>>;

public class GetUserFriendsQueryHandler : IRequestHandler<GetUserFriendsQuery, List<UserProfileDto>>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserFriendRepository _userFriendRepository;

    public GetUserFriendsQueryHandler(
        IHttpContextAccessor httpContextAccessor,
        IUserFriendRepository userFriendRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _userFriendRepository = userFriendRepository;
    }

    public async Task<List<UserProfileDto>> Handle(GetUserFriendsQuery request, CancellationToken cancellationToken)
    {
        HttpContext httpContext = _httpContextAccessor.HttpContext!;
        
        Guid userId = httpContext.User.GetUserId();

        List<UserFriend> userFriends = await _userFriendRepository
            .GetUserFriendsAsync(userId, cancellationToken);

        List<UserProfileDto> userProfiles = userFriends
            .ConvertAll(x => x.Friend.MapToDto(httpContext.Request));
        
        return userProfiles;
    }
}