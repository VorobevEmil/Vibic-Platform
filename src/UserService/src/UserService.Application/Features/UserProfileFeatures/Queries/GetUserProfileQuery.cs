using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Exceptions;

namespace UserService.Application.Features.UserProfileFeatures.Queries;

public record GetUserProfileQuery(Guid Id) : IRequest<UserProfileDto>;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IUserProfileRepository _repository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetUserProfileHandler(
        IUserProfileRepository repository,
        IHttpContextAccessor httpContextAccessor)
    {
        _repository = repository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        HttpContext httpContext = _httpContextAccessor.HttpContext!;
        
        UserProfile userProfile = await _repository.GetByIdAsync(request.Id, cancellationToken);

        return userProfile.MapToDto(httpContext.Request);
    }
}