using System.Reflection;
using System.Globalization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
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
            Uri normalizedRabbitUri = NormalizeRabbitMqUri(rabbitUri);

            string serviceName = Assembly.GetEntryAssembly()!.GetName().Name!.Split('.')[0];
            string serviceSlug = ToKebabCase(serviceName);

            Assembly? appAssembly = FindApplicationAssembly(serviceName);
            EventTopology[] eventTopologies = BuildEventTopologies(serviceSlug, appAssembly);

            EnsureRabbitMqTopology(normalizedRabbitUri, serviceSlug, eventTopologies);

            RabbitMqTransportExpression rabbit = opts.UseRabbitMq(normalizedRabbitUri);

            // ── Dead-letter infrastructure (always declared) ──────────────────
            rabbit.DeclareExchange(VibicExchanges.DeadLetter, e =>
            {
                e.ExchangeType = Wolverine.RabbitMQ.ExchangeType.Fanout;
                e.IsDurable = true;
                e.BindQueue(VibicExchanges.DeadLetterQueue, "");
            });
            rabbit.DeclareQueue(VibicExchanges.DeadLetterQueue, q => q.IsDurable = true);

            // ── Event exchanges + per-service queue subscriptions ─────────────
            foreach (EventTopology topology in eventTopologies)
            {
                rabbit.DeclareExchange(topology.Exchange, e =>
                {
                    e.ExchangeType = Wolverine.RabbitMQ.ExchangeType.Fanout;
                    e.IsDurable = true;
                    if (topology.QueueName is not null)
                        e.BindQueue(topology.QueueName, "");
                });

                if (topology.QueueName is not null)
                {
                    rabbit.DeclareQueue(topology.QueueName, q =>
                    {
                        q.IsDurable = true;
                        q.Arguments["x-dead-letter-exchange"] = VibicExchanges.DeadLetter;
                    });
                    opts.ListenToRabbitQueue(topology.QueueName, q =>
                    {
                        q.IsDurable = true;
                        q.Arguments["x-dead-letter-exchange"] = VibicExchanges.DeadLetter;
                    });
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

    private static EventTopology[] BuildEventTopologies(string serviceSlug, Assembly? appAssembly)
    {
        (Type messageType, string exchange)[] eventMap =
        [
            (typeof(CreateUserProfileEvent), VibicExchanges.UserProfileCreated),
            (typeof(CreateUserChatEvent),    VibicExchanges.UserChatCreated),
            (typeof(UpdateUserAvatarEvent),  VibicExchanges.UserAvatarUpdated),
        ];

        return
        [
            .. eventMap.Select(definition =>
            {
                bool hasSubscription = appAssembly is not null && HasHandler(appAssembly, definition.messageType);
                string? queueName = hasSubscription
                    ? $"{serviceSlug}.{definition.exchange["vibic.".Length..]}"
                    : null;

                return new EventTopology(definition.exchange, queueName);
            })
        ];
    }

    private static void EnsureRabbitMqTopology(Uri rabbitUri, string serviceSlug, IReadOnlyCollection<EventTopology> eventTopologies)
    {
        ConnectionFactory factory = new()
        {
            Uri = rabbitUri,
            ClientProvidedName = $"{serviceSlug}-topology-bootstrap",
            AutomaticRecoveryEnabled = true,
        };

        Exception? lastError = null;

        for (int attempt = 1; attempt <= 10; attempt++)
        {
            try
            {
                EnsureRabbitMqTopologyAsync(factory, eventTopologies).GetAwaiter().GetResult();
                return;
            }
            catch (Exception ex) when (attempt < 10)
            {
                lastError = ex;
                Thread.Sleep(TimeSpan.FromSeconds(Math.Min(attempt, 3)));
            }
        }

        throw new InvalidOperationException(
            $"Failed to declare RabbitMQ topology for '{serviceSlug}' after multiple attempts.",
            lastError);
    }

    private static async Task EnsureRabbitMqTopologyAsync(
        ConnectionFactory factory,
        IReadOnlyCollection<EventTopology> eventTopologies,
        CancellationToken cancellationToken = default)
    {
        await using IConnection connection = await factory.CreateConnectionAsync(cancellationToken);
        await using IChannel channel = await connection.CreateChannelAsync(cancellationToken: cancellationToken);

        await channel.ExchangeDeclareAsync(
            VibicExchanges.DeadLetter,
            type: "fanout",
            durable: true,
            autoDelete: false,
            arguments: null,
            passive: false,
            noWait: false,
            cancellationToken: cancellationToken);

        await channel.QueueDeclareAsync(
            VibicExchanges.DeadLetterQueue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            passive: false,
            noWait: false,
            cancellationToken: cancellationToken);

        await channel.QueueBindAsync(
            VibicExchanges.DeadLetterQueue,
            VibicExchanges.DeadLetter,
            routingKey: string.Empty,
            arguments: null,
            noWait: false,
            cancellationToken: cancellationToken);

        foreach (EventTopology topology in eventTopologies)
        {
            await channel.ExchangeDeclareAsync(
                topology.Exchange,
                type: "fanout",
                durable: true,
                autoDelete: false,
                arguments: null,
                passive: false,
                noWait: false,
                cancellationToken: cancellationToken);

            if (topology.QueueName is null)
                continue;

            Dictionary<string, object?> queueArguments = new()
            {
                ["x-dead-letter-exchange"] = VibicExchanges.DeadLetter,
            };

            await channel.QueueDeclareAsync(
                topology.QueueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: queueArguments,
                passive: false,
                noWait: false,
                cancellationToken: cancellationToken);

            await channel.QueueBindAsync(
                topology.QueueName,
                topology.Exchange,
                routingKey: string.Empty,
                arguments: null,
                noWait: false,
                cancellationToken: cancellationToken);
        }
    }

    private static Uri NormalizeRabbitMqUri(string rabbitUri)
    {
        string normalized = rabbitUri.Trim();

        if (normalized.StartsWith("rabbitmq://", true, CultureInfo.InvariantCulture))
            normalized = "amqp://" + normalized["rabbitmq://".Length..];

        return new Uri(normalized);
    }

    private sealed record EventTopology(string Exchange, string? QueueName);
}
