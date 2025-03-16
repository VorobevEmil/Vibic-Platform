using System.Security.Claims;

namespace OAuthServer.Application.Interfaces.OpenIdDict;

public interface IOpenIdDictUserService
{
    Dictionary<string, object> GetUserInfo(ClaimsPrincipal user);
}