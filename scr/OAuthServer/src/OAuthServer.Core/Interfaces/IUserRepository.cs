using OAuthServer.Core.Entities;

namespace OAuthServer.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
}