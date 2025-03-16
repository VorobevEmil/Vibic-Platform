using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using OpenIddict.Abstractions;

namespace OAuthServer.Application.Interfaces.OpenId;

public interface IOpenIdTokenService
{
    Task<ClaimsPrincipal> ExchangeTokenAsync(OpenIddictRequest request, HttpContext httpContext);
}