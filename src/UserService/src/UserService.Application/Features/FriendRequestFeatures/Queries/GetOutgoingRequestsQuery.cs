using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Features.FriendRequestFeatures.Common;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Extensions;

namespace UserService.Application.Features.FriendRequestFeatures.Queries;

public record GetOutgoingRequestsQuery : IRequest<List<FriendRequestDto>>;

public class GetOutgoingRequestsQueryHandler : IRequestHandler<GetOutgoingRequestsQuery, List<FriendRequestDto>>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IFriendRequestRepository _friendRequestRepository;

    public GetOutgoingRequestsQueryHandler(
        IHttpContextAccessor httpContextAccessor,
        IFriendRequestRepository friendRequestRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _friendRequestRepository = friendRequestRepository;
    }

    public async Task<List<FriendRequestDto>> Handle(GetOutgoingRequestsQuery request,
        CancellationToken cancellationToken)
    {
        HttpContext httpContext = _httpContextAccessor.HttpContext!;
        Guid userId = httpContext.User.GetUserId();

        List<FriendRequest> friendRequests = await _friendRequestRepository
            .GetOutgoingRequestsAsync(userId, cancellationToken);

        return friendRequests.ConvertAll(fr => fr.MapToDto(fr.Receiver, httpContext.Request));
    }
}