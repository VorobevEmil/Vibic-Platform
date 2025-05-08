using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Infrastructure.Data;

namespace ChatChannelService.Infrastructure.Repositories;

public class ServerMemberRepository : IServerMemberRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ServerMemberRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task CreateAsync(ServerMember serverMember, CancellationToken cancellationToken = default)
    {
        await _dbContext.ServerMembers.AddAsync(serverMember, cancellationToken);
    }
}