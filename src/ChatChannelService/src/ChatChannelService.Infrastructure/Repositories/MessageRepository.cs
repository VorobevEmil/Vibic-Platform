using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatChannelService.Infrastructure.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly ApplicationDbContext _dbContext;

    public MessageRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Message>> GetAllByChannelIdAsync(Guid channelId, CancellationToken cancellationToken)
    {
        return await _dbContext.Messages
            .Include(m => m.Channel)
            .Include(m => m.ChatUser)
            .Where(m => m.ChannelId == channelId)
            .ToListAsync(cancellationToken);
    }

    public async Task CreateAsync(Message message, CancellationToken cancellationToken = default)
    {
        await _dbContext.Messages.AddAsync(message, cancellationToken);
    }
}