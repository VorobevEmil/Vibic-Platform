using OAuthServer.Core.Entities;
using OAuthServer.Core.Interfaces;

namespace OAuthServer.Infrastructure.Data.Repositories;

public class UserProviderRepository : IUserProviderRepository
{
    private readonly ApplicationDbContext _db;

    public UserProviderRepository(ApplicationDbContext db)
    {
        _db = db;
    }
    
    public async Task CreateAsync(UserProvider userProvider)
    {
       await _db.AddAsync(userProvider);
       await _db.SaveChangesAsync();
    }
}