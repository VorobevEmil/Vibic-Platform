using OpenIddict.EntityFrameworkCore.Models;

namespace OAuthServer.Core.Entities;

public class UserProvider
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string? OpenIddictApplicationId { get; private set; }
    public User User { get; private set; }
    public OpenIddictEntityFrameworkCoreApplication OpenIddictOpenIddictApplication { get; private set; }

    private UserProvider()
    {
    }

    public UserProvider(User user, OpenIddictEntityFrameworkCoreApplication openIddictApplication)
    {
        UserId = user.Id;
        OpenIddictApplicationId = openIddictApplication.Id;
        User = user;
        OpenIddictOpenIddictApplication = openIddictApplication;
    }
}