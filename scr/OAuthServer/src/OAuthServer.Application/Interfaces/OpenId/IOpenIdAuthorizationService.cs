using System.Security.Claims;
using OpenIddict.Abstractions;

namespace OAuthServer.Application.Interfaces.OpenId;

public interface IOpenIdAuthorizationService
{
    ClaimsPrincipal Authorize(ClaimsPrincipal user, OpenIddictRequest request);
}