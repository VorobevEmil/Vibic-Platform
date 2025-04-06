using MediatR;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;
using OAuthServer.Application.Repositories;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Get;

public class GetApplicationHandler : IRequestHandler<GetApplicationQuery, ApplicationDTO>
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

    public async Task<ApplicationDTO> Handle(GetApplicationQuery query, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        OpenIddictEntityFrameworkCoreApplication application =
            await _openIddictApplicationRepository.GetApplicationByIdAndUserIdAsync(query.Id, userId)
            ?? throw new NotFoundException("Application not found");

        return application.MapToDTO();
    }
}