using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IChatUserRepository
{
    Task CreateAsync(ChatUser chatUser, CancellationToken cancellationToken = default);
    Task<ChatUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}