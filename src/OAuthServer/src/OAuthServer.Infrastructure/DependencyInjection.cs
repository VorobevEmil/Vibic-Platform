using Microsoft.Extensions.DependencyInjection;
using OAuthServer.Application.Repositories;
using OAuthServer.Infrastructure.Data;
using OAuthServer.Infrastructure.Data.Repositories;
using Vibic.Shared.EF;

namespace OAuthServer.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddApplicationDbContext<ApplicationDbContext>();
        services.AddRepositories();
        return services;
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserProviderRepository, UserProviderRepository>();
        services.AddScoped<IOpenIddictApplicationRepository, OpenIddictApplicationRepository>();
        return services;
    }
}