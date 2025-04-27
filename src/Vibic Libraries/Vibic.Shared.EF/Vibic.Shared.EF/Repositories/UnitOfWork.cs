using Vibic.Shared.EF.Interfaces;

namespace Vibic.Shared.EF.Repositories;

public class UnitOfWork<TDbContext> : IUnitOfWork where TDbContext : SharedDbContext
{
    private readonly TDbContext _context;

    public UnitOfWork(TDbContext context)
    {
        _context = context;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}