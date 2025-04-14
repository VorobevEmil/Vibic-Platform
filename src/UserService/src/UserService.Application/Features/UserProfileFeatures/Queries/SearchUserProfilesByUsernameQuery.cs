using MediatR;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Application.Repositories;
using UserService.Core.Entities;

namespace UserService.Application.Features.UserProfileFeatures.Queries;

public record SearchUserProfilesByUsernameQuery(string Username) : IRequest<List<UserProfileDto>>;

public class SearchUserProfilesByUsernameHandler :
    IRequestHandler<SearchUserProfilesByUsernameQuery, List<UserProfileDto>>
{
    private readonly IUserProfileRepository _userProfileRepository;

    public SearchUserProfilesByUsernameHandler(
        IUserProfileRepository userProfileRepository)
    {
        _userProfileRepository = userProfileRepository;
    }

    public async Task<List<UserProfileDto>> Handle(SearchUserProfilesByUsernameQuery request,
        CancellationToken cancellationToken)
    {
        List<UserProfile> users = await _userProfileRepository.GetAllByUsernameAsync(request.Username);

        return users.ConvertAll(x => x.MapToDto());
    }
}