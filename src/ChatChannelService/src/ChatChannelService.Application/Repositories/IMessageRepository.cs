using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IMessageRepository
{
    Task<List<Message>> GetAllByChannelIdAsync(Guid channelId, CancellationToken cancellationToken);
    Task CreateAsync(Message message, CancellationToken cancellationToken = default);
}