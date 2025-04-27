using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Extensions;

namespace UserService.Application.Features.UserProfileFeatures.Queries;

public record SearchUserProfilesByUsernameQuery(string Username) : IRequest<List<UserProfileDto>>;

public class SearchUserProfilesByUsernameHandler :
    IRequestHandler<SearchUserProfilesByUsernameQuery, List<UserProfileDto>>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserProfileRepository _userProfileRepository;

    public SearchUserProfilesByUsernameHandler(
        IHttpContextAccessor httpContextAccessor,
        IUserProfileRepository userProfileRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _userProfileRepository = userProfileRepository;
    }

    public async Task<List<UserProfileDto>> Handle(SearchUserProfilesByUsernameQuery request,
        CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        List<UserProfile> users = await _userProfileRepository.GetAllByUsernameAsync(request.Username, userId, cancellationToken);

        return users.ConvertAll(x => x.MapToDto());
    }
}