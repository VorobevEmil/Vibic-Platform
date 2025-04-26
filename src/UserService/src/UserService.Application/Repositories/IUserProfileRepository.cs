using UserService.Core.Entities;

namespace UserService.Application.Repositories;

public interface IUserProfileRepository
{
    Task<List<UserProfile>> GetAllByUsernameAsync(string username, Guid userId, CancellationToken cancellationToken = default);
    Task<UserProfile> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(UserProfile profile, CancellationToken cancellationToken = default);
}