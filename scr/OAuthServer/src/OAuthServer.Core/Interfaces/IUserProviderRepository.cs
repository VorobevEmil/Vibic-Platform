using OAuthServer.Core.Entities;

namespace OAuthServer.Core.Interfaces;

public interface IUserProviderRepository
{
    Task CreateAsync(UserProvider userProvider);
}