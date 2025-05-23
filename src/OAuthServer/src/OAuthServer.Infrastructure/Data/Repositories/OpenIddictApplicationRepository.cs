using Microsoft.EntityFrameworkCore;
using OAuthServer.Application.Repositories;
using OAuthServer.Core.Entities;
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
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        UserProvider? userProvider = await _dbContext.UserProvider
            .Include(p => p.OpenIddictOpenIddictApplication)
            .FirstOrDefaultAsync(p => 
                    p.OpenIddictApplicationId == applicationId && p.UserId == userId,
                cancellationToken: cancellationToken);

        return userProvider?.OpenIddictOpenIddictApplication;
    }

    public async Task<List<OpenIddictEntityFrameworkCoreApplication>> GetApplicationsByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.UserProvider
            .Include(x => x.OpenIddictOpenIddictApplication)
            .Where(x => x.UserId == userId)
            .Select(x => x.OpenIddictOpenIddictApplication)
            .ToListAsync(cancellationToken: cancellationToken);
    }
}