using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Core.Enums;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatChannelService.Infrastructure.Repositories;

public class ChannelRepository : IChannelRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ChannelRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Channel>> GetUserDirectMessageChannelsAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Channels
            .Include(x => x.ChannelMembers)
            .Where(x => x.Type == ChannelType.DirectMessage &&
                        x.ChannelMembers.Any(y => y.ChatUserId == userId))
            .ToListAsync(cancellationToken);
    }

    public async Task CreateAsync(Channel channel, CancellationToken cancellationToken)
    {
        await _dbContext.Channels.AddAsync(channel, cancellationToken);
    }
}