using Microsoft.Extensions.DependencyInjection;
using OAuthServer.Application.Interfaces;
using OAuthServer.Application.Interfaces.OpenIdDict;
using OAuthServer.Application.Services;
using OAuthServer.Application.Services.OpenIdDict;
using OAuthServer.Core.Entities;
using OpenIdDictUserService = OAuthServer.Application.Services.OpenIdDict.OpenIdDictUserService;

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
        services.AddScoped<IOpenIdDictAuthorizationService, OpenIdDictAuthorizationService>();
        services.AddScoped<IOpenIdDictTokenService, OpenIdDictTokenService>();
        services.AddScoped<OpenIdDictUserService, OpenIdDictUserService>();
        services.AddScoped<IUserAuthenticationService, UserAuthenticationService>();
        return services;
    }
}