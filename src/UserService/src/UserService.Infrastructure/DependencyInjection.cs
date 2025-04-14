using Microsoft.Extensions.DependencyInjection;
using UserService.Application.Repositories;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.Repositories;
using Vibic.Shared.Core;

namespace UserService.Infrastructure;

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
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        return services;
    }
}