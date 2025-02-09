using OpenIddict.EntityFrameworkCore.Models;

namespace AuthService.Data.Models;

public class OAuthEntityFrameworkCoreApplication : OpenIddictEntityFrameworkCoreApplication<int,
    OAuthEntityFrameworkCoreAuthorization,
    OAuthEntityFrameworkCoreToken>
{
}