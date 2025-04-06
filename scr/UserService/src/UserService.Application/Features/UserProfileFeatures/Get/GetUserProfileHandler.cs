using MediatR;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Core.Entities;
using UserService.Core.Interfaces;
using Vibic.Shared.Core.Exceptions;

namespace UserService.Application.Features.UserProfileFeatures.Get;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserProfileDTO>
{
    private readonly IUserProfileRepository _repository;

    public GetUserProfileHandler(IUserProfileRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserProfileDTO> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        UserProfile userProfile = await _repository.GetByIdAsync(request.Id)
                                  ?? throw new NotFoundException("User profile not found");

        return userProfile.MapToDTO();
    }
}