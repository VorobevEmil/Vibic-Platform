using Microsoft.EntityFrameworkCore;
using OAuthServer.Core.Entities;
using OAuthServer.Core.Interfaces;
using OpenIddict.EntityFrameworkCore.Models;

namespace OAuthServer.Infrastructure.Data.Repositories;

public class OpenIddictApplicationRepository : IOpenIddictApplicationRepository
{
    private readonly ApplicationDbContext _dbContext;

    public OpenIddictApplicationRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OpenIddictEntityFrameworkCoreApplication?> GetApplicationByIdAndUserIdAsync(
        string applicationId,
        Guid userId)
    {
        UserProvider? userProvider = await _dbContext.UserProvider
            .Include(p => p.OpenIddictOpenIddictApplication)
            .FirstOrDefaultAsync(p => p.OpenIddictApplicationId == applicationId && p.UserId == userId);
        
        return userProvider?.OpenIddictOpenIddictApplication;
    }

    public async Task<List<OpenIddictEntityFrameworkCoreApplication>> GetApplicationsByUserIdAsync(Guid userId)
    {
        return await _dbContext.UserProvider
            .Include(x => x.OpenIddictOpenIddictApplication)
            .Where(x => x.UserId == userId)
            .Select(x => x.OpenIddictOpenIddictApplication)
            .ToListAsync();
    }
}