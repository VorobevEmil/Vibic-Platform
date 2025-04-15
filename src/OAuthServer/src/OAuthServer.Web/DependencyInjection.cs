using Microsoft.AspNetCore.Authentication.Cookies;
using OAuthServer.Infrastructure.Data;

namespace OAuthServer.Web;

public static class DependencyInjection
{
    public static IServiceCollection AddCookieAuthentication(this IServiceCollection services)
    {
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
            {
                options.Events = new CookieAuthenticationEvents
                {
                    OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    },

                    OnRedirectToAccessDenied = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    }
                };
            });
        
        return services;
    }

    public static IServiceCollection AddOpenIdDictServer(this IServiceCollection services)
    {
        services.AddOpenIddict()
            .AddCore(options =>
            {
                options.UseEntityFrameworkCore()
                    .UseDbContext<ApplicationDbContext>();
            })
            .AddServer(options =>
            {
                options.SetTokenEndpointUris("api/connect/token")
                    .SetIntrospectionEndpointUris("api/connect/token/introspect")
                    .SetRevocationEndpointUris("api/connect/token/revoke")
                    .SetAuthorizationEndpointUris("api/connect/authorize")
                    .SetUserInfoEndpointUris("api/connect/userinfo");

                options.RegisterScopes("openid", "profile", "email");

                options.AllowClientCredentialsFlow();
                options.AllowRefreshTokenFlow();
                options.AllowAuthorizationCodeFlow()
                    .RequireProofKeyForCodeExchange();

                options.AddDevelopmentEncryptionCertificate()
                    .AddDevelopmentSigningCertificate();
                options.DisableAccessTokenEncryption();

                options.UseAspNetCore()
                    .EnableTokenEndpointPassthrough()
                    .EnableAuthorizationEndpointPassthrough()
                    .EnableTokenEndpointPassthrough()
                    .EnableUserInfoEndpointPassthrough();
            })
            .AddValidation(options =>
            {
                options.UseLocalServer();
                options.UseAspNetCore();
            });

        return services;
    }
}