using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IServerRepository
{
    Task<List<Server>> GetServersByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Server?> GetServerByIdAsync(Guid id, CancellationToken cancellationToken = default);
    void Delete(Server server);
}