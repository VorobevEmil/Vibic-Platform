using OpenIddict.EntityFrameworkCore.Models;

namespace AuthService.Data.Models;

public class OAuthEntityFrameworkCoreToken
    : OpenIddictEntityFrameworkCoreToken<
        int,
        OAuthEntityFrameworkCoreApplication,
        OAuthEntityFrameworkCoreAuthorization>
{
}