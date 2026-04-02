using System.Text.Json;

namespace Vibic.Shared.EF.Entities;

public class OutboxMessage
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string MessageType { get; init; } = string.Empty;
    public string Payload { get; init; } = string.Empty;
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
    public DateTime AvailableAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public int Attempts { get; set; }
    public string? Error { get; set; }

    public static OutboxMessage Create<TMessage>(TMessage message) where TMessage : class
    {
        return new OutboxMessage
        {
            MessageType = typeof(TMessage).AssemblyQualifiedName!,
            Payload = JsonSerializer.Serialize(message)
        };
    }
}
