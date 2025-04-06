using Microsoft.EntityFrameworkCore;
using UserService.Core.Entities;
using UserService.Core.Interfaces;
using UserService.Infrastructure.Data;

namespace UserService.Infrastructure.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly ApplicationDbContext _dbContext;

    public UserProfileRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserProfile?> GetByIdAsync(Guid userId)
    {
        return await _dbContext.UserProfiles.FindAsync(userId);
    }

    public Task<bool> ExistsAsync(Guid id)
    {
        return _dbContext.UserProfiles.AnyAsync(p => p.Id == id);
    }

    public async Task AddAsync(UserProfile profile)
    {
        await _dbContext.UserProfiles.AddAsync(profile);
    }
}
