using UserService.Core.Entities;

namespace UserService.Application.Repositories;

public interface IFriendRequestRepository
{
    Task<FriendRequest> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<FriendRequest>> GetIncomingRequestsAsync(Guid userId, CancellationToken cancellationToken);
    Task<List<FriendRequest>> GetOutgoingRequestsAsync(Guid userId, CancellationToken cancellationToken);
    Task CreateAsync(FriendRequest friendRequest, CancellationToken cancellationToken = default);
}