using Microsoft.Extensions.DependencyInjection;
using UserService.Application.Interfaces;
using UserService.Application.Repositories;
using UserService.Infrastructure.Constants;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.FileStorage;
using UserService.Infrastructure.Repositories;
using Vibic.Shared.Core;

namespace UserService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddApplicationDbContext<ApplicationDbContext>();
        services.AddRepositories();
        services.AddHttpClients();
        return services;
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IFileStorageClient, FileStorageClient>();
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        return services;
    }

    private static IServiceCollection AddHttpClients(this IServiceCollection services)
    {
        services.AddHttpClient();

        services.AddHttpClient(HttpClientConstants.FileService, client =>
        {
            client.BaseAddress = new Uri("https://localhost:7205");
        });

        return services;
    }
}