using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Vibic.Shared.EF.Entities;
using Vibic.Shared.EF.Interfaces;
using Wolverine;

namespace Vibic.Shared.Messaging.Outbox;

public class OutboxPublisherService(
    IServiceScopeFactory scopeFactory,
    ILogger<OutboxPublisherService> logger) : BackgroundService
{
    private static readonly TimeSpan PollingInterval = TimeSpan.FromSeconds(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingMessagesAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Outbox publisher encountered an unexpected error");
            }

            await Task.Delay(PollingInterval, stoppingToken);
        }
    }

    private async Task ProcessPendingMessagesAsync(CancellationToken ct)
    {
        await using AsyncServiceScope scope = scopeFactory.CreateAsyncScope();
        IOutboxRepository repository = scope.ServiceProvider.GetRequiredService<IOutboxRepository>();
        IMessageBus messageBus = scope.ServiceProvider.GetRequiredService<IMessageBus>();

        IList<OutboxMessage> messages = await repository.GetPendingAsync(ct);

        foreach (OutboxMessage message in messages)
        {
            await PublishMessageAsync(repository, messageBus, message, ct);
        }
    }

    private async Task PublishMessageAsync(
        IOutboxRepository repository,
        IMessageBus messageBus,
        OutboxMessage message,
        CancellationToken ct)
    {
        try
        {
            Type? messageType = Type.GetType(message.MessageType);
            if (messageType is null)
            {
                logger.LogWarning("Unknown outbox message type {MessageType}, skipping", message.MessageType);
                await repository.MarkAsProcessedAsync(message.Id, ct);
                return;
            }

            object? payload = JsonSerializer.Deserialize(message.Payload, messageType);
            if (payload is null)
            {
                logger.LogWarning("Failed to deserialize outbox message {MessageId}, skipping", message.Id);
                await repository.MarkAsProcessedAsync(message.Id, ct);
                return;
            }

            await messageBus.PublishAsync(payload);
            await repository.MarkAsProcessedAsync(message.Id, ct);

            logger.LogDebug("Published outbox message {MessageId} of type {MessageType}",
                message.Id, message.MessageType);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to publish outbox message {MessageId}", message.Id);
            await repository.RecordFailureAsync(message.Id, ex.Message, ct);
        }
    }
}
