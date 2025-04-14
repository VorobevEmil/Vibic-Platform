using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Infrastructure.Data;

namespace ChatChannelService.Infrastructure.Repositories;

public class ChatUserRepository : IChatUserRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ChatUserRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task CreateAsync(ChatUser chatUser)
    {
        await _dbContext.ChatUsers.AddAsync(chatUser);
    }
}