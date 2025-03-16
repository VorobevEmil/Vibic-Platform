using OAuthServer.Core.Entities;

namespace OAuthServer.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string userId) => GetByIdAsync(Guid.Parse(userId));
    Task<User?> GetByIdAsync(Guid userId);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
}