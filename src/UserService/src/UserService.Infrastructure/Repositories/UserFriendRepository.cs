using Microsoft.EntityFrameworkCore;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using UserService.Infrastructure.Data;

namespace UserService.Infrastructure.Repositories;

public class UserFriendRepository : IUserFriendRepository
{
    private readonly ApplicationDbContext _context;

    public UserFriendRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task CreateAsync(UserFriend userFriend, CancellationToken cancellationToken = default)
    {
        await _context.UserFriends.AddAsync(userFriend, cancellationToken);
    }

    public async Task<List<UserFriend>> GetUserFriendsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.UserFriends
            .Where(uf => uf.UserId == userId)
            .Include(uf => uf.Friend)
            .ToListAsync(cancellationToken: cancellationToken);
    }

    public async Task<bool> RemoveFriendshipAsync(Guid userId, Guid friendId, CancellationToken cancellationToken = default)
    {
        List<UserFriend> friendships = await _context.UserFriends
            .Where(uf => (uf.UserId == userId && uf.FriendId == friendId)
                         || (uf.UserId == friendId && uf.FriendId == userId))
            .ToListAsync(cancellationToken);

        if (friendships.Count == 0)
        {
            return false;
        }

        _context.UserFriends.RemoveRange(friendships);

        return true;
    }
}
