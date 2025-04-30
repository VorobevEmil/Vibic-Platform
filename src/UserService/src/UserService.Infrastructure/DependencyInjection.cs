using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UserService.Application.Interfaces;
using UserService.Application.Repositories;
using UserService.Infrastructure.Configurations;
using UserService.Infrastructure.Constants;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.FileStorage;
using UserService.Infrastructure.Repositories;
using Vibic.Shared.EF;

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
        IConfiguration configuration = services.BuildServiceProvider().GetRequiredService<IConfiguration>();
        FileServiceSettings fileService = configuration.GetSection("FileService").Get<FileServiceSettings>()!;
        
        services.AddHttpClient();

        services.AddHttpClient(HttpClientConstants.FileService, client =>
        {
            client.BaseAddress = new Uri(fileService.Url);
        });

        return services;
    }
}