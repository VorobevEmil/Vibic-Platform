using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IReactionRepository
{
    Task<Reaction?> GetByMessageIdAndUserIdAsync(Guid messageId, Guid userId, CancellationToken cancellationToken = default);
    Task<Reaction?> GetByMessageIdUserIdAndEmojiAsync(Guid messageId, Guid userId, string emoji, CancellationToken cancellationToken = default);
    Task<List<Reaction>> GetByMessageIdAsync(Guid messageId, CancellationToken cancellationToken = default);
    Task CreateAsync(Reaction reaction, CancellationToken cancellationToken = default);
    void Delete(Reaction reaction);
}