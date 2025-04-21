using ChatChannelService.Application.Common.Pagination;
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

    public async Task<List<Message>> GetAllByChannelIdAsync(
        Guid channelId,
        Cursor? cursor,
        int limit,
        CancellationToken cancellationToken)
    {
        IQueryable<Message> query = _dbContext.Messages
            .Include(m => m.Channel)
            .Include(m => m.Sender)
            .Where(m => m.ChannelId == channelId);

        query = query.OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id);

        if (cursor != null)
        {
            query = query.Where(m =>
                m.CreatedAt < cursor.DateTime ||
                (m.CreatedAt == cursor.DateTime && m.Id < cursor.LastId));
        }

        return await query
            .Take(limit + 1)
            .ToListAsync(cancellationToken);
    }

    public async Task CreateAsync(Message message, CancellationToken cancellationToken = default)
    {
        await _dbContext.Messages.AddAsync(message, cancellationToken);
    }
}