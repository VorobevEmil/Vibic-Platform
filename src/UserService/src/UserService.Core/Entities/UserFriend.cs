namespace UserService.Core.Entities;

public class UserFriend
{
    private UserFriend(){}
    public UserFriend(UserProfile user, UserProfile friend)
    {
        User = user;
        UserId = user.Id;
        Friend = friend;
        FriendId = friend.Id;
    }
    
    public Guid UserId { get; init; }
    public UserProfile User { get; init; }

    public Guid FriendId { get; init; }
    public UserProfile Friend { get; init; }

    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
}
