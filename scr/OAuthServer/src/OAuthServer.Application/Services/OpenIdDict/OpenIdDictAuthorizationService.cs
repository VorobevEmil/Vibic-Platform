using System.Security.Claims;
using OAuthServer.Application.Interfaces;
using OAuthServer.Application.Interfaces.OpenIdDict;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace OAuthServer.Application.Services.OpenIdDict;

public class OpenIdDictAuthorizationService : IOpenIdDictAuthorizationService
{
    public ClaimsPrincipal Authorize(ClaimsPrincipal user, OpenIddictRequest request)
    {
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

        var identity = new ClaimsIdentity(claims, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        foreach (var claim in principal.Claims)
        {
            claim.SetDestinations(OpenIddictConstants.Destinations.AccessToken);
        }

        principal.SetScopes(OpenIddictConstants.Scopes.OpenId, OpenIddictConstants.Scopes.Profile, OpenIddictConstants.Scopes.Email);
        return principal;
    }
}