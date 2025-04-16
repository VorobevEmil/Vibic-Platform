using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatChannelService.Infrastructure.Repositories;

public class ChatUserRepository : IChatUserRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ChatUserRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ChatUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ChatUsers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task CreateAsync(ChatUser chatUser, CancellationToken cancellationToken = default)
    {
        await _dbContext.ChatUsers.AddAsync(chatUser, cancellationToken);
    }
}