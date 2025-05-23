using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Extensions;

namespace UserService.Application.Features.UserProfileFeatures.Queries;

public record GetMyProfileQuery : IRequest<UserProfileDto>;

public class GetMyProfileHandler : IRequestHandler<GetMyProfileQuery, UserProfileDto>
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


    public async Task<UserProfileDto> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        HttpContext httpContext = _httpContextAccessor.HttpContext!;
        Guid userId = httpContext.User.GetUserId();
        UserProfile userProfile = await _repository.GetByIdAsync(userId, cancellationToken);

        return userProfile.MapToDto(httpContext.Request);
    }
}