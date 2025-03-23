using System.Reflection;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Vibic.Shared.Messaging;

public static class DependencyInjection
{
    public static IServiceCollection AddRabbitMq(this IServiceCollection services)
    {
        IConfiguration configuration = services.BuildServiceProvider().GetService<IConfiguration>()!;

        services.AddMassTransit(x =>
        {
            Assembly entryAssembly = Assembly.GetEntryAssembly()!;
            AssemblyName[] referencedAssemblies = entryAssembly.GetReferencedAssemblies();

            string globalName = entryAssembly.GetName().Name!.Split('.')[0];

            AssemblyName? applicationAssemblyName = referencedAssemblies
                .FirstOrDefault(a => a.Name != null && a.Name == $"{globalName}.Application");

            if (applicationAssemblyName != null)
            {
                Assembly applicationAssembly = Assembly.Load(applicationAssemblyName);
            
                x.AddConsumers(applicationAssembly);
            }
            
            x.SetKebabCaseEndpointNameFormatter();

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(configuration.GetConnectionString("RabbitMq"));
                cfg.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(5)));
                cfg.PrefetchCount = 1;
                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}