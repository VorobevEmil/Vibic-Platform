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
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddApplicationDbContext<ApplicationDbContext>();
        services.AddOutboxRepository<ApplicationDbContext>();
        services.AddRepositories();
        services.AddHttpClients(configuration);
        return services;
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IFileStorageClient, FileStorageClient>();
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        services.AddScoped<IFriendRequestRepository, FriendRequestRepository>();
        services.AddScoped<IUserFriendRepository, UserFriendRepository>();
        return services;
    }

    private static IServiceCollection AddHttpClients(this IServiceCollection services, IConfiguration configuration)
    {
        FileServiceSettings? fileService = configuration.GetSection("FileService").Get<FileServiceSettings>();
        if (fileService is null || string.IsNullOrWhiteSpace(fileService.Url))
        {
            throw new InvalidOperationException("Missing FileService:Url configuration.");
        }

        services.AddHttpClient();

        services.AddHttpClient(HttpClientConstants.FileService, client =>
        {
            client.BaseAddress = new Uri(fileService.Url);
        });

        return services;
    }
}
