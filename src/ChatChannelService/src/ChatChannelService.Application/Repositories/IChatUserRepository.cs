using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IChatUserRepository
{
    Task CreateAsync(ChatUser chatUser);
}