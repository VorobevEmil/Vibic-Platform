using System.Security.Claims;
using OAuthServer.Application.Interfaces.OpenId;
using OpenIddict.Abstractions;

namespace OAuthServer.Application.Services.OpenId;

public class OpenIdUserService : IOpenIdUserService
{
    public Dictionary<string, object> GetUserInfo(ClaimsPrincipal user)
    {
        return new Dictionary<string, object>
        {
            [OpenIddictConstants.Claims.Subject] = user.FindFirst(OpenIddictConstants.Claims.Subject)?.Value!,
            [OpenIddictConstants.Claims.Name] = user.FindFirst(OpenIddictConstants.Claims.Name)?.Value!,
            [OpenIddictConstants.Claims.Email] = user.FindFirst(OpenIddictConstants.Claims.Email)?.Value!
        };
    }
}
