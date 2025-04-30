using FileService.Application.Interfaces;
using FileService.Infrastructure.Configurations;
using FileService.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;

namespace FileService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services,
        ConfigurationManager configuration)
    {
        services.AddMinio(configuration);
        services.AddHttpClient();
        services.AddScoped<IFileStorageService, FileStorageService>();
        return services;
    }

    private static IServiceCollection AddMinio(this IServiceCollection services, ConfigurationManager configuration)
    {
        MinioSettings minio = configuration.GetSection("Minio").Get<MinioSettings>()!;

        services.AddMinio(options =>
        {
            options
                .WithEndpoint(minio.Endpoint)
                .WithCredentials(minio.AccessKey, minio.SecretKey)
                .WithSSL(false);
        });

        return services;
    }
}