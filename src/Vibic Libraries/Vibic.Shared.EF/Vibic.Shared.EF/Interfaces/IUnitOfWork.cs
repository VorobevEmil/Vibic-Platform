namespace Vibic.Shared.EF.Interfaces;

public interface IUnitOfWork
{
    IOutboxRepository OutboxRepository { get; }
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}