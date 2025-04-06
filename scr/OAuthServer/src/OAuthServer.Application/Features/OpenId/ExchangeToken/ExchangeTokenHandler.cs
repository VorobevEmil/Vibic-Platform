using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace OAuthServer.Application.Features.OpenId.ExchangeToken;

public class ExchangeTokenHandler : IRequestHandler<ExchangeTokenCommand, ClaimsPrincipal>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ExchangeTokenHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<ClaimsPrincipal> Handle(ExchangeTokenCommand command,
        CancellationToken cancellationToken)
    {
        OpenIddictRequest request = command.Request;
        HttpContext httpContext = _httpContextAccessor.HttpContext!;
        if (request.IsRefreshTokenGrantType())
        {
            AuthenticateResult result = await httpContext
                .AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
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
            AuthenticateResult result = await httpContext
                .AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
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