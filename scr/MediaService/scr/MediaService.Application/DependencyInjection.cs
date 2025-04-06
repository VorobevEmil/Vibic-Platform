using MediaService.Application.Interfaces;
using MediaService.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace MediaService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddServices();
        return services;
    }

    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddSingleton<IVoiceService, VoiceService>();
        
        return services;
    }
}