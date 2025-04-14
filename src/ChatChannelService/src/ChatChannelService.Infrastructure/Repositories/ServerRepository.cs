using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatChannelService.Infrastructure.Repositories;

public class ServerRepository : IServerRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ServerRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Server>> GetServersByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Servers
            .Include(x => x.ServerMembers)
            .Where(s => s.ServerMembers.Any(sm => sm.ChatUserId == userId))
            .ToListAsync(cancellationToken);
    }

    public async Task<Server?> GetServerByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Servers
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken: cancellationToken);
    }

    public void Delete(Server server)
    {
        _dbContext.Servers.Remove(server);
    }
}