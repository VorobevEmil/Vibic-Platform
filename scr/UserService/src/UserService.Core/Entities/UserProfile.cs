using UserService.Core.Enums;

namespace UserService.Core.Entities;

public class UserProfile
{
    public Guid Id { get; private set; }
    public string Username { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;

    public string? AvatarUrl { get; private set; }
    public string? Bio { get; private set; }
    public UserStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }

    private UserProfile() {}

    public UserProfile(Guid id, string username, string email)
    {
        Id = id;
        Username = username;
        Email = email;
        CreatedAt = DateTime.UtcNow;
    }
}