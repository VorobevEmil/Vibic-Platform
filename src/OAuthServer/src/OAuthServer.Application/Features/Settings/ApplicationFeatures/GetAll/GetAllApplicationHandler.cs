using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;
using OAuthServer.Application.Repositories;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.Core.Extensions;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.GetAll;

public class GetAllApplicationHandler : IRequestHandler<GetAllApplicationQuery, List<ApplicationDTO>>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IOpenIddictApplicationRepository _openIddictApplicationRepository;

    public GetAllApplicationHandler(
        IHttpContextAccessor httpContextAccessor,
        IOpenIddictApplicationRepository openIddictApplicationRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _openIddictApplicationRepository = openIddictApplicationRepository;
    }

    public async Task<List<ApplicationDTO>> Handle(
        GetAllApplicationQuery query,
        CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        List<OpenIddictEntityFrameworkCoreApplication> applications =
            await _openIddictApplicationRepository.GetApplicationsByUserIdAsync(userId);

        return applications.ConvertAll(x => x.MapToDTO());
    }
}