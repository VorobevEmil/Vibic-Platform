using OAuthServer.Core.Entities;

namespace OAuthServer.Application.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid userId);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
}