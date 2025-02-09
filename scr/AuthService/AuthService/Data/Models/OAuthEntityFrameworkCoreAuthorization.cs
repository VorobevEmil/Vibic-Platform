using OpenIddict.EntityFrameworkCore.Models;

namespace AuthService.Data.Models;

public class OAuthEntityFrameworkCoreAuthorization : OpenIddictEntityFrameworkCoreAuthorization<int,
    OAuthEntityFrameworkCoreApplication, OAuthEntityFrameworkCoreToken>
{
}