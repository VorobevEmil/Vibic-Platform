using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatChannelService.Infrastructure.Repositories;

public class ReactionRepository : IReactionRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ReactionRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Reaction?> GetByMessageIdAndUserIdAsync(Guid messageId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Reactions
            .FirstOrDefaultAsync(r => r.MessageId == messageId && r.UserId == userId, cancellationToken);
    }

    public async Task<Reaction?> GetByMessageIdUserIdAndEmojiAsync(Guid messageId, Guid userId, string emoji, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Reactions
            .FirstOrDefaultAsync(r => r.MessageId == messageId && r.UserId == userId && r.Emoji == emoji, cancellationToken);
    }

    public async Task<List<Reaction>> GetByMessageIdAsync(Guid messageId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Reactions
            .Where(r => r.MessageId == messageId)
            .ToListAsync(cancellationToken);
    }

    public async Task CreateAsync(Reaction reaction, CancellationToken cancellationToken = default)
    {
        await _dbContext.Reactions.AddAsync(reaction, cancellationToken);
    }

    public void Delete(Reaction reaction)
    {
        _dbContext.Reactions.Remove(reaction);
    }
}