using AuthService.Data.Models;

namespace AuthService.Helpers.EFCore.OAuth;

public static class OAuthEntityFrameworkCoreBuilder
{
    public static OpenIddictEntityFrameworkCoreBuilder ReplaceWithCustomOAuthEntities(
        this OpenIddictEntityFrameworkCoreBuilder builder
    )
    {
        builder.ReplaceDefaultEntities<OAuthEntityFrameworkCoreApplication,
            OAuthEntityFrameworkCoreAuthorization,
            OAuthEntityFrameworkCoreScope,
            OAuthEntityFrameworkCoreToken, int>();
        return builder;
    }
}

