using System.Security.Claims;

namespace OAuthServer.Application.Interfaces.OpenId;

public interface IOpenIdUserService
{
    Dictionary<string, object> GetUserInfo(ClaimsPrincipal user);
}