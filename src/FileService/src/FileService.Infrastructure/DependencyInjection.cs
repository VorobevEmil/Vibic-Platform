using FileService.Application.Interfaces;
using FileService.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Minio;

namespace FileService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddMinio();
        services.AddHttpClient();
        services.AddScoped<IFileStorageService, FileStorageService>();
        return services;
    }

    private static IServiceCollection AddMinio(this IServiceCollection services)
    {
        string accessKey = "sH99Q09rYccld0S04ZGN";
        string secretKey = "8JFD5SSxG8aTAq0O17MDn5quVAa8IpGbZutCpKHx";

        services.AddMinio(options =>
        {
            options
                .WithEndpoint("localhost", 9000)
                .WithCredentials(accessKey, secretKey)
                .WithSSL(false);
        });

        return services;
    }
}