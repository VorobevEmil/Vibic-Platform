using UserService.Core.Entities;

namespace UserService.Core.Interfaces;

public interface IUserProfileRepository
{
    Task<bool> ExistsAsync(Guid id);
    Task AddAsync(UserProfile profile);
}