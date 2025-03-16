using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using OpenIddict.Abstractions;

namespace OAuthServer.Application.Interfaces.OpenIdDict;

public interface IOpenIdDictTokenService
{
    Task<ClaimsPrincipal> ExchangeTokenAsync(OpenIddictRequest request, HttpContext httpContext);
}