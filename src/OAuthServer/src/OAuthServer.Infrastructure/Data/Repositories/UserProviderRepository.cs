using OAuthServer.Application.Repositories;
using OAuthServer.Core.Entities;

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
    }
}