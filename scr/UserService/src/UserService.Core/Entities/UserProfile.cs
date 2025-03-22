using UserService.Core.Enums;

namespace UserService.Core.Entities;

public class UserProfile
{
    public Guid Id { get; private set; }
    public string Username { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;

    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public UserStatus Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    private UserProfile() {}

    public UserProfile(Guid id, string username, string email)
    {
        Id = id;
        Username = username;
        Email = email;
    }
}