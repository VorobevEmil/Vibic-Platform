using System.Threading.Channels;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Enums;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Channel = ChatChannelService.Core.Entities.Channel;

namespace ChatChannelService.Infrastructure.Repositories;

public class ChannelRepository : IChannelRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ChannelRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Channel>> GetUserDirectChannelsAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Channels
            .Where(x => x.ChannelType == ChannelType.Direct &&
                        x.ChannelMembers.Any(y => y.ChatUserId == userId))
            .Select(channel => new
            {
                Channel = channel,
                LastMessageDate = channel.Messages
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => m.CreatedAt)
                    .FirstOrDefault()
            })
            .OrderByDescending(x => x.LastMessageDate)
            .Select(x => x.Channel)
            .Include(x => x.ChannelMembers)
            .ThenInclude(x => x.ChatUser)
            .ToListAsync(cancellationToken);
    }

    public async Task<Channel?> FindDirectChannelForUserAsync(
        Guid userId,
        Guid channelId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Channels
            .Include(x => x.ChannelMembers)
            .ThenInclude(x => x.ChatUser)
            .FirstOrDefaultAsync(x =>
                    x.ChannelType == ChannelType.Direct &&
                    x.Id == channelId &&
                    x.ChannelMembers.Any(y => y.ChatUserId == userId),
                cancellationToken);
    }

    public async Task<Channel?> FindAccessibleServerChannelForUserAsync(
        Guid userId,
        Guid serverId,
        Guid channelId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Channels
            .Include(x => x.ChannelMembers)
            .ThenInclude(x => x.ChatUser)
            .FirstOrDefaultAsync(x =>
                    x.ChannelType == ChannelType.Server &&
                    x.Id == channelId &&
                    x.ServerId == serverId &&
                    x.Server!.ServerMembers.Any(sm => sm.ChatUserId == userId) &&
                    (
                        x.IsPublic ||
                        x.ChannelMembers.Any(y => y.ChatUserId == userId)
                    ),
                cancellationToken);
    }

    public async Task<Channel> GetFirstChannelOfServerAsync(
        Guid serverId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Channels
            .OrderBy(x => x.Id)
            .FirstAsync(x =>
                x.ServerId == serverId &&
                x.ChannelType == ChannelType.Server &&
                x.IsPublic, cancellationToken);
    }

    public async Task CreateAsync(Channel channel, CancellationToken cancellationToken)
    {
        await _dbContext.Channels.AddAsync(channel, cancellationToken);
    }

    public async Task<bool> DoesDirectChannelWithUsersExistAsync(Guid userId, Guid memberUserId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Channels
            .Include(x => x.ChannelMembers)
            .AnyAsync(c => c.ChannelType == ChannelType.Direct && c.ChannelMembers
                .All(cm => cm.ChatUserId == userId || cm.ChatUserId == memberUserId), cancellationToken);
    }
}