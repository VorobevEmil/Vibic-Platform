using Vibic.Shared.EF.Entities;

namespace Vibic.Shared.EF.Interfaces;

public interface IOutboxRepository
{
    Task AddAsync(OutboxMessage message, CancellationToken ct = default);
    Task<IList<OutboxMessage>> GetPendingAsync(CancellationToken ct = default);
    Task MarkAsProcessedAsync(Guid id, CancellationToken ct = default);
    Task RecordFailureAsync(Guid id, string error, CancellationToken ct = default);
}
