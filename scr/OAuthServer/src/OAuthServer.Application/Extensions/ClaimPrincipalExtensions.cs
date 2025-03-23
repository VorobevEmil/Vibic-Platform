using System.Security.Claims;

namespace OAuthServer.Application.Extensions;

public static class ClaimPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        return Guid.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }
}