using Microsoft.Extensions.DependencyInjection;
using OAuthServer.Application.Interfaces;
using OAuthServer.Application.Interfaces.OpenId;
using OAuthServer.Application.Services;
using OAuthServer.Application.Services.OpenId;

namespace OAuthServer.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddServices();
        return services;
    }

    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddScoped<IOpenIdAuthorizationService, OpenIdAuthorizationService>();
        services.AddScoped<IOpenIdTokenService, OpenIdTokenService>();
        services.AddScoped<OpenIdUserService, OpenIdUserService>();
        services.AddScoped<IUserAuthenticationService, UserAuthenticationService>();
        services.AddScoped<IOpenIdApplicationService, OpenIdApplicationService>();
        return services;
    }
}