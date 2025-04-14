using ChatChannelService.Application.Repositories;
using ChatChannelService.Infrastructure.Data;
using ChatChannelService.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Vibic.Shared.Core;

namespace ChatChannelService.Infrastructure;

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
        services.AddScoped<IChatUserRepository, ChatUserRepository>();
        return services;
    }
}