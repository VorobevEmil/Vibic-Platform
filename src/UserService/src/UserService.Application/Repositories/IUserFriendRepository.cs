using UserService.Core.Entities;

namespace UserService.Application.Repositories;

public interface IUserFriendRepository
{
    Task CreateAsync(UserFriend userFriend, CancellationToken cancellationToken = default);
    Task<List<UserFriend>> GetUserFriendsAsync(Guid userId, CancellationToken cancellationToken = default);
}