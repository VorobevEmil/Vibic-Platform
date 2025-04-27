using Vibic.Shared.EF.Entities;
using Vibic.Shared.EF.Interfaces;

namespace OAuthServer.Core.Entities;

public class User : BaseEntity, IUpdatable, ISoftDeletable
{
    public string Username { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public bool IsEmailConfirmed { get; private set; }
    public bool IsLockedOut { get; private set; }
    public int AccessFailedCount { get; private set; }
    public DateTime? LockoutEnd { get; private set; }
    public List<UserProvider> UserProviders { get; private set; } = new();

    public DateTime? UpdatedAt { get; init; }
    public bool IsDeleted { get; init; }
    public DateTime? DeletedAt { get; init; }

    private User()
    {
        
    }

    public User(string username, string email, string passwordHash)
    {
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
    }
}