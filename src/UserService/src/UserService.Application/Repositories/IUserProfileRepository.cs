using UserService.Core.Entities;

namespace UserService.Application.Repositories;

public interface IUserProfileRepository
{
    Task<UserProfile?> GetByIdAsync(Guid userId);
    Task<bool> ExistsAsync(Guid id);
    Task AddAsync(UserProfile profile);
}