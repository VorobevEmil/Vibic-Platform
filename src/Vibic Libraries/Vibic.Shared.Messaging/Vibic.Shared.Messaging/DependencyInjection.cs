using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Vibic.Shared.Messaging.Contracts.Users;
using Vibic.Shared.Messaging.Outbox;
using Vibic.Shared.Messaging.Topology;
using Wolverine;
using Wolverine.ErrorHandling;
using Wolverine.RabbitMQ;
using Wolverine.RabbitMQ.Internal;

namespace Vibic.Shared.Messaging;

public static class DependencyInjection
{
    /// <summary>
    /// Registers Wolverine with RabbitMQ. Per service automatically:
    /// - declares all Vibic fanout exchanges (durable)
    /// - declares a dead-letter exchange + queue
    /// - discovers handlers in the {ServiceName}.Application assembly
    /// - creates and binds queues only for events the service actually handles
    /// - configures publish routing for all known events
    /// </summary>
    public static IHostBuilder AddVibicMessaging(this IHostBuilder host)
    {
        return host.UseWolverine(opts =>
        {
            ServiceProvider sp = opts.Services.BuildServiceProvider();
            IConfiguration config = sp.GetRequiredService<IConfiguration>();

            string rabbitUri = config["ConnectionStrings:RabbitMq"]
                ?? throw new InvalidOperationException("Missing ConnectionStrings:RabbitMq");

            string serviceName = Assembly.GetEntryAssembly()!.GetName().Name!.Split('.')[0];
            string serviceSlug = ToKebabCase(serviceName);

            Assembly? appAssembly = FindApplicationAssembly(serviceName);

            RabbitMqTransportExpression rabbit = opts.UseRabbitMq(new Uri(rabbitUri));

            // ── Dead-letter infrastructure (always declared) ──────────────────
            rabbit.DeclareExchange(VibicExchanges.DeadLetter, e =>
            {
                e.ExchangeType = ExchangeType.Fanout;
                e.IsDurable = true;
                e.BindQueue(VibicExchanges.DeadLetterQueue, "");
            });
            rabbit.DeclareQueue(VibicExchanges.DeadLetterQueue, q => q.IsDurable = true);

            // ── Event exchanges + per-service queue subscriptions ─────────────
            (Type messageType, string exchange)[] eventMap =
            [
                (typeof(CreateUserProfileEvent), VibicExchanges.UserProfileCreated),
                (typeof(CreateUserChatEvent),    VibicExchanges.UserChatCreated),
                (typeof(UpdateUserAvatarEvent),  VibicExchanges.UserAvatarUpdated),
            ];

            foreach ((Type messageType, string exchange) in eventMap)
            {
                bool hasSubscription = appAssembly is not null && HasHandler(appAssembly, messageType);
                string? queueName = hasSubscription
                    // "vibic.user.profile-created" → "user-service.user.profile-created"
                    ? $"{serviceSlug}.{exchange["vibic.".Length..]}"
                    : null;

                rabbit.DeclareExchange(exchange, e =>
                {
                    e.ExchangeType = ExchangeType.Fanout;
                    e.IsDurable = true;
                    if (queueName is not null)
                        e.BindQueue(queueName, "");
                });

                if (queueName is not null)
                {
                    rabbit.DeclareQueue(queueName, q =>
                    {
                        q.IsDurable = true;
                        q.Arguments["x-dead-letter-exchange"] = VibicExchanges.DeadLetter;
                    });
                    opts.ListenToRabbitQueue(queueName);
                }
            }

            // ── Publish routing (all services) ────────────────────────────────
            opts.PublishMessage<CreateUserProfileEvent>().ToRabbitExchange(VibicExchanges.UserProfileCreated);
            opts.PublishMessage<CreateUserChatEvent>().ToRabbitExchange(VibicExchanges.UserChatCreated);
            opts.PublishMessage<UpdateUserAvatarEvent>().ToRabbitExchange(VibicExchanges.UserAvatarUpdated);

            // ── Handler discovery ─────────────────────────────────────────────
            if (appAssembly is not null)
                opts.Discovery.IncludeAssembly(appAssembly);

            // ── Retry policy ──────────────────────────────────────────────────
            opts.Policies.OnException<Exception>()
                .RetryWithCooldown(
                    TimeSpan.FromSeconds(5),
                    TimeSpan.FromSeconds(15),
                    TimeSpan.FromSeconds(30));
        });
    }

    public static IServiceCollection AddOutboxPublisher(this IServiceCollection services)
    {
        services.AddHostedService<OutboxPublisherService>();
        return services;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /// <summary>
    /// Checks whether the assembly contains a Wolverine handler for the given message type.
    /// Convention: public non-abstract class with Handle / HandleAsync / Consume / ConsumeAsync
    /// method whose first parameter is the message type.
    /// </summary>
    private static bool HasHandler(Assembly assembly, Type messageType)
    {
        return assembly.GetExportedTypes()
            .Where(t => !t.IsAbstract)
            .SelectMany(t => t.GetMethods(BindingFlags.Public | BindingFlags.Instance))
            .Where(m => m.Name is "Handle" or "HandleAsync" or "Consume" or "ConsumeAsync")
            .Any(m => m.GetParameters().FirstOrDefault()?.ParameterType == messageType);
    }

    private static Assembly? FindApplicationAssembly(string serviceName)
    {
        AssemblyName? name = Assembly.GetEntryAssembly()!
            .GetReferencedAssemblies()
            .FirstOrDefault(a => a.Name == $"{serviceName}.Application");

        return name is not null ? Assembly.Load(name) : null;
    }

    private static string ToKebabCase(string name)
    {
        return string.Concat(name.Select((c, i) =>
            i > 0 && char.IsUpper(c)
                ? "-" + char.ToLower(c)
                : char.ToLower(c).ToString()));
    }
}
