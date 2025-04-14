using MediatR;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;
using OAuthServer.Application.Repositories;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Queries;

public sealed record GetApplicationQuery(string Id) : IRequest<ApplicationDto>;

public class GetApplicationHandler : IRequestHandler<GetApplicationQuery, ApplicationDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IOpenIddictApplicationRepository _openIddictApplicationRepository;

    public GetApplicationHandler(
        IHttpContextAccessor httpContextAccessor,
        IOpenIddictApplicationRepository openIddictApplicationRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _openIddictApplicationRepository = openIddictApplicationRepository;
    }

    public async Task<ApplicationDto> Handle(GetApplicationQuery query, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        OpenIddictEntityFrameworkCoreApplication application =
            await _openIddictApplicationRepository.GetApplicationByIdAndUserIdAsync(query.Id, userId, cancellationToken)
            ?? throw new NotFoundException("Application not found");

        return application.MapToDTO();
    }
}