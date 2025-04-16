using UserService.Core.Entities;

namespace UserService.Application.Repositories;

public interface IUserProfileRepository
{
    Task<List<UserProfile>> GetAllByUsernameAsync(string username, Guid userId);
    Task<UserProfile?> GetByIdAsync(Guid userId);
    Task<bool> ExistsAsync(Guid id);
    Task AddAsync(UserProfile profile);
}