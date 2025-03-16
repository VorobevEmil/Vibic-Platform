using System.Security.Claims;
using OpenIddict.Abstractions;

namespace OAuthServer.Application.Interfaces.OpenIdDict;

public interface IOpenIdDictAuthorizationService
{
    ClaimsPrincipal Authorize(ClaimsPrincipal user, OpenIddictRequest request);
}