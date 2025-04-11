using Vibic.Shared.Core.Entities;

namespace OAuthServer.Core.Entities;

public class User : BaseEntity
{
    public string Username { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public bool IsEmailConfirmed { get; private set; }
    public bool IsLockedOut { get; private set; }
    public int AccessFailedCount { get; private set; }
    public DateTimeOffset? LockoutEnd { get; private set; }
    public List<UserProvider> UserProviders { get; private set; } = new();

    private User()
    {
        
    }

    public User(string username, string email, string passwordHash)
    {
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        CreatedAt = DateTimeOffset.Now;
    }
}