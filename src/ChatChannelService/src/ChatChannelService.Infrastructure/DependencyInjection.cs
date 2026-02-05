using ChatChannelService.Application.Repositories;
using ChatChannelService.Application.Interfaces;
using ChatChannelService.Infrastructure.Configurations;
using ChatChannelService.Infrastructure.Constants;
using ChatChannelService.Infrastructure.Data;
using ChatChannelService.Infrastructure.FileStorage;
using ChatChannelService.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Vibic.Shared.EF;

namespace ChatChannelService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddOptions<FileServiceSettings>()
            .BindConfiguration("FileService")
            .ValidateDataAnnotations();

        services.AddHttpClient(HttpClientConstants.FileService, (sp, client) =>
        {
            FileServiceSettings settings = sp.GetRequiredService<IOptions<FileServiceSettings>>().Value;
            client.BaseAddress = new Uri(settings.Url);
        });
        services.AddScoped<IFileStorageClient, FileStorageClient>();

        services.AddApplicationDbContext<ApplicationDbContext>();
        services.AddRepositories();
        return services;
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IChannelRepository, ChannelRepository>();
        services.AddScoped<IChatUserRepository, ChatUserRepository>();
        services.AddScoped<IServerRepository, ServerRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IInviteRepository, InviteRepository>();
        services.AddScoped<IServerMemberRepository, ServerMemberRepository>();
        return services;
    }
}
