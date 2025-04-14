using MediatR;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;
using OAuthServer.Application.Repositories;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.Core.Extensions;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Queries;

public sealed record GetAllApplicationQuery : IRequest<List<ApplicationDto>>;

public class GetAllApplicationHandler : IRequestHandler<GetAllApplicationQuery, List<ApplicationDto>>
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

    public async Task<List<ApplicationDto>> Handle(
        GetAllApplicationQuery query,
        CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        List<OpenIddictEntityFrameworkCoreApplication> applications =
            await _openIddictApplicationRepository.GetApplicationsByUserIdAsync(userId, cancellationToken);

        return applications.ConvertAll(x => x.MapToDTO());
    }
}