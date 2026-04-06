using Microsoft.EntityFrameworkCore;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using UserService.Infrastructure.Data;
using Vibic.Shared.Core.Exceptions;

namespace UserService.Infrastructure.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly ApplicationDbContext _dbContext;

    public UserProfileRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<UserProfile>> GetAllByUsernameAsync(string username, Guid userId,
        CancellationToken cancellationToken = default)
    {
        List<UserProfile> users = await _dbContext.UserProfiles
            .Where(x => x.Id != userId && x.Username.Contains(username))
            .ToListAsync(cancellationToken: cancellationToken);

        return users;
    }

    public async Task<List<UserProfile>> GetByIdsAsync(
        IEnumerable<Guid> userIds,
        CancellationToken cancellationToken = default)
    {
        Guid[] ids = userIds
            .Distinct()
            .ToArray();

        if (ids.Length == 0)
        {
            return [];
        }

        return await _dbContext.UserProfiles
            .Where(profile => ids.Contains(profile.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<UserProfile> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        UserProfile? userProfile = await _dbContext.UserProfiles
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
        
        if (userProfile == null)
        {
            throw new NotFoundException("User profile not found");
        }
        
        return userProfile;
    }

    public Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.UserProfiles.AnyAsync(p => p.Id == id, cancellationToken: cancellationToken);
    }

    public async Task AddAsync(UserProfile profile, CancellationToken cancellationToken = default)
    {
        await _dbContext.UserProfiles.AddAsync(profile, cancellationToken);
    }
}
