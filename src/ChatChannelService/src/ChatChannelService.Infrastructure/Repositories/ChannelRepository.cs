using System.Threading.Channels;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Enums;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Vibic.Shared.Core.Exceptions;
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
            .Include(x => x.Server)
            .ThenInclude(server => server!.ServerMembers)
            .ThenInclude(serverMember => serverMember.ChatUser)
            .Include(x => x.ChannelMembers)
            .ThenInclude(x => x.ChatUser)
            .FirstOrDefaultAsync(x =>
                    x.ChannelType == ChannelType.Server &&
                    x.Id == channelId &&
                    x.ServerId == serverId &&
                    x.Server!.ServerMembers.Any(sm => sm.ChatUserId == userId) &&
                    (
                        x.Server.OwnerId == userId ||
                        x.IsPublic ||
                        x.ChannelMembers.Any(y => y.ChatUserId == userId)
                    ),
                cancellationToken);
    }

    public async Task<Channel> GetServerChannelByIdAsync(
        Guid serverId,
        Guid channelId,
        CancellationToken cancellationToken = default)
    {
        Channel? channel = await _dbContext.Channels
            .Include(x => x.Server)
            .Include(x => x.ChannelMembers)
            .ThenInclude(x => x.ChatUser)
            .FirstOrDefaultAsync(x =>
                    x.ServerId == serverId &&
                    x.Id == channelId &&
                    x.ChannelType != ChannelType.Direct,
                cancellationToken);

        if (channel == null)
        {
            throw new NotFoundException($"Channel with id {channelId} not found");
        }

        return channel;
    }

    public async Task<Channel> GetServerChannelByIdForOwnerAsync(
        Guid serverId,
        Guid channelId,
        Guid ownerId,
        CancellationToken cancellationToken = default)
    {
        Channel? channel = await _dbContext.Channels
            .Include(x => x.Server)
            .ThenInclude(server => server!.ServerMembers)
            .ThenInclude(serverMember => serverMember.ChatUser)
            .Include(x => x.ChannelMembers)
            .ThenInclude(x => x.ChatUser)
            .FirstOrDefaultAsync(x =>
                    x.ServerId == serverId &&
                    x.Id == channelId &&
                    x.ChannelType != ChannelType.Direct &&
                    x.Server != null &&
                    x.Server.OwnerId == ownerId,
                cancellationToken);

        if (channel == null)
        {
            throw new NotFoundException($"Channel with id {channelId} not found");
        }

        return channel;
    }

    public async Task<List<Channel>> GetServerChannelsByServerIdAsync(
        Guid serverId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Channels
            .Where(x => x.ServerId == serverId && x.ChannelType != ChannelType.Direct)
            .ToListAsync(cancellationToken);
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

    public void Delete(Channel channel)
    {
        _dbContext.Channels.Remove(channel);
    }
}
