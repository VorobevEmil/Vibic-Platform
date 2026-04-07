using ChatChannelService.Application.Common.Pagination;
using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IMessageRepository
{
    Task<List<Message>> GetAllByChannelIdAsync(Guid channelId, Cursor? cursor, int limit, CancellationToken cancellationToken);
    Task<Message?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task CreateAsync(Message message, CancellationToken cancellationToken = default);
    void Delete(Message message);
}