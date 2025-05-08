using UserService.Core.Enums;
using Vibic.Shared.EF.Entities;

namespace UserService.Core.Entities;

public class UserProfile : BaseEntity
{
    public string DisplayName { get; private set; } = string.Empty;
    public string Username { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; }
    public string? Bio { get; private set; }
    public UserStatus Status { get; private set; }
    public List<UserFriend> UserFriends { get; init; } = [];

    private UserProfile() {}

    public UserProfile(Guid id, string displayName, string username, string email, string? avatarUrl)
    {
        Id = id;
        DisplayName = displayName;
        Username = username;
        Email = email;
        AvatarUrl = avatarUrl;
    }

    public void UpdateProfile(string username, string? avatarUrl, string? bio)
    {
        Username = username;
        AvatarUrl = avatarUrl;
        Bio = bio;
    }

    public void UpdateStatus(UserStatus status)
    {
        Status = status;
    }

    public void UpdateAvatarUrl(string url)
    {
        AvatarUrl = url;
    }
}