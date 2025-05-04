using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Vibic.Shared.Core.Exceptions;

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

    public async Task<Server> GetServerByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        Server? server = await _dbContext.Servers
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken: cancellationToken);
        
        if (server == null)
        {
            throw new NotFoundException($"Server with id {id} not found");
        }


        return server;
    }

    public async Task<Server> GetServerByIdForUserAsync(
        Guid id, 
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        Server? server = await _dbContext.Servers
            .Include(x => x.Channels
                .Where(c => c.IsPublic || c.ChannelMembers
                    .Any(cm => cm.ChatUserId == userId)))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken: cancellationToken);
        
        if (server == null)
        {
            throw new NotFoundException($"Server with id {id} not found");
        }

        return server;
    }
    
    public async Task CreateAsync(Server server, CancellationToken cancellationToken = default)
    {
        await _dbContext.Servers.AddAsync(server, cancellationToken);
    }

    public void Delete(Server server)
    {
        _dbContext.Servers.Remove(server);
    }
}