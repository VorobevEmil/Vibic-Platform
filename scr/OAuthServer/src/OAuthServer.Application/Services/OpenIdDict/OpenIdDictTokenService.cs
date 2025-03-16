using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using OAuthServer.Application.Interfaces.OpenIdDict;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace OAuthServer.Application.Services.OpenIdDict;

public class OpenIdDictTokenService : IOpenIdDictTokenService
{
    public async Task<ClaimsPrincipal> ExchangeTokenAsync(OpenIddictRequest request, HttpContext httpContext)
    {
        if (request.IsRefreshTokenGrantType())
        {
            AuthenticateResult result = await httpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            return result.Principal!;
        }

        if (request.IsClientCredentialsGrantType())
        {
            ClaimsIdentity identity = new(authenticationType: TokenValidationParameters.DefaultAuthenticationType);
            identity.SetClaim(OpenIddictConstants.Claims.Subject, request.ClientId);
            identity.SetScopes(request.GetScopes());

            return new ClaimsPrincipal(identity);
        }

        if (request.IsAuthorizationCodeGrantType())
        {
            AuthenticateResult result = await httpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            if (!result.Succeeded)
            {
                throw new UnauthorizedAccessException("Invalid authorization code.");
            }

            List<Claim> claims = result.Principal.Claims.ToList();
            ClaimsIdentity identity = new(claims, TokenValidationParameters.DefaultAuthenticationType);
            ClaimsPrincipal principal = new(identity);
            principal.SetScopes(result.Principal.GetScopes());

            return principal;
        }

        throw new NotImplementedException("Unsupported grant type.");
    }
}