using Microsoft.EntityFrameworkCore;
using Vibic.Shared.Core.Interfaces;

namespace Vibic.Shared.Core.Repositories;

public class UnitOfWork<TDbContext> : IUnitOfWork where TDbContext : DbContext
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