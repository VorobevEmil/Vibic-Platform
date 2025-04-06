using OAuthServer.Core.Entities;

namespace OAuthServer.Application.Repositories;

public interface IUserProviderRepository
{
    Task CreateAsync(UserProvider userProvider);
}