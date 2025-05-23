using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace OAuthServer.Application.Features.OpenIdFeatures.Commands;

public record AuthorizeCommand(OpenIddictRequest Request) : IRequest<ClaimsPrincipal>;

public class AuthorizeHandler : IRequestHandler<AuthorizeCommand, ClaimsPrincipal>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthorizeHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Task<ClaimsPrincipal> Handle(AuthorizeCommand command, CancellationToken cancellationToken)
    {
        ClaimsPrincipal user = _httpContextAccessor.HttpContext!.User;

        if (!user.Identity?.IsAuthenticated ?? true)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        List<Claim> claims =
        [
            new(OpenIddictConstants.Claims.Subject, user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? ""),
            new(OpenIddictConstants.Claims.Name, user.Identity.Name ?? ""),
            new(OpenIddictConstants.Claims.Email, user.FindFirst(ClaimTypes.Email)?.Value ?? "")
        ];

        ClaimsIdentity identity = new(claims, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        ClaimsPrincipal principal = new(identity);

        foreach (Claim claim in principal.Claims)
        {
            claim.SetDestinations(OpenIddictConstants.Destinations.AccessToken);
        }

        principal.SetScopes(OpenIddictConstants.Scopes.OpenId, OpenIddictConstants.Scopes.Profile,
            OpenIddictConstants.Scopes.Email);
        return Task.FromResult(principal);
    }
}