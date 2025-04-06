using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Core.Entities;
using UserService.Core.Interfaces;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;

namespace UserService.Application.Features.UserProfileFeatures.GetMyProfile;

public class GetMyProfileHandler : IRequestHandler<GetMyProfileQuery, UserProfileDTO>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserProfileRepository _repository;

    public GetMyProfileHandler(
        IHttpContextAccessor httpContextAccessor,
        IUserProfileRepository repository)
    {
        _httpContextAccessor = httpContextAccessor;
        _repository = repository;
    }


    public async Task<UserProfileDTO> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        UserProfile userProfile = await _repository.GetByIdAsync(userId)
                                  ?? throw new NotFoundException("User profile not found");

        return userProfile.MapToDTO();
    }
}