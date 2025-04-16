using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IChannelRepository
{
    Task<List<Channel>> GetUserDirectMessageChannelsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task CreateAsync(Channel channel, CancellationToken cancellationToken);
}