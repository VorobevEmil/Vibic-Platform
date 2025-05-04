using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IChannelRepository
{
    Task<List<Channel>> GetUserDirectChannelsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Channel?> FindDirectChannelForUserAsync(Guid userId, Guid channelId, CancellationToken cancellationToken = default);

    Task<Channel?> FindAccessibleServerChannelForUserAsync(
        Guid userId,
        Guid serverId,
        Guid channelId,
        CancellationToken cancellationToken = default);
    Task<Channel> GetFirstChannelOfServerAsync(Guid serverId, CancellationToken cancellationToken = default);
    Task CreateAsync(Channel channel, CancellationToken cancellationToken = default);
    Task<bool> DoesDirectChannelWithUsersExistAsync(Guid userId, Guid memberUserId, CancellationToken cancellationToken = default);
}