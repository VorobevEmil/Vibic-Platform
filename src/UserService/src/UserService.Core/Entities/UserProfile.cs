using UserService.Core.Enums;
using Vibic.Shared.Core.Entities;

namespace UserService.Core.Entities;

public class UserProfile : BaseEntity
{
    public string Username { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; }
    public string? Bio { get; private set; }
    public UserStatus Status { get; private set; }

    private UserProfile() {}

    public UserProfile(Guid id, string username, string email, string? avatarUrl)
    {
        Id = id;
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
}