using MediatR;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Exceptions;

namespace UserService.Application.Features.UserProfileFeatures.Queries;

public record GetUserProfileQuery(Guid Id) : IRequest<UserProfileDto>;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IUserProfileRepository _repository;

    public GetUserProfileHandler(IUserProfileRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        UserProfile userProfile = await _repository.GetByIdAsync(request.Id, cancellationToken);

        return userProfile.MapToDto();
    }
}