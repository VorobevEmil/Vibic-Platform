using Microsoft.EntityFrameworkCore;
using Vibic.Shared.EF.Entities;
using Vibic.Shared.EF.Interfaces;

namespace Vibic.Shared.EF.Repositories;

public class OutboxRepository<TDbContext>(TDbContext context) : IOutboxRepository
    where TDbContext : DbContext
{
    private readonly DbSet<OutboxMessage> _outboxMessages = context.Set<OutboxMessage>();

    public async Task AddAsync(OutboxMessage message, CancellationToken ct = default)
    {
        await _outboxMessages.AddAsync(message, ct);
        await context.SaveChangesAsync(ct);
    }

    public Task<IList<OutboxMessage>> GetPendingAsync(CancellationToken ct = default)
    {
        DateTime now = DateTime.UtcNow;
        return _outboxMessages
            .Where(m => m.ProcessedAt == null && m.AvailableAt <= now && m.Attempts < 5)
            .OrderBy(m => m.OccurredAt)
            .Take(50)
            .ToListAsync(ct)
            .ContinueWith(t => (IList<OutboxMessage>)t.Result, ct);
    }

    public Task MarkAsProcessedAsync(Guid id, CancellationToken ct = default)
    {
        return _outboxMessages
            .Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.ProcessedAt, DateTime.UtcNow), ct);
    }

    public Task RecordFailureAsync(Guid id, string error, CancellationToken ct = default)
    {
        // Exponential-like backoff: 30s × attempts
        return _outboxMessages
            .Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(m => m.Attempts, m => m.Attempts + 1)
                .SetProperty(m => m.Error, error)
                .SetProperty(m => m.AvailableAt, m => DateTime.UtcNow.AddSeconds(30 * (m.Attempts + 1))), ct);
    }
}
