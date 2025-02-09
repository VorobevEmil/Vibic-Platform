using AuthService.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Helpers.EFCore.OAuth;

public static class DcOAuthEntityFrameworkCoreExtensions
{
    public static DbContextOptionsBuilder UseCustomOAuth(this DbContextOptionsBuilder builder)
        => builder.UseOpenIddict<OAuthEntityFrameworkCoreApplication,
            OAuthEntityFrameworkCoreAuthorization,
            OAuthEntityFrameworkCoreScope,
            OAuthEntityFrameworkCoreToken, int>();
}
