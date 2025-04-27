using Microsoft.EntityFrameworkCore;
using OAuthServer.Application.Repositories;
using OAuthServer.Core.Entities;
using Vibic.Shared.Core.Exceptions;

namespace OAuthServer.Infrastructure.Data.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        User? user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken: cancellationToken);

        if (user is null)
        {
            throw new NotFoundException("User not found");
        }
        
        return user;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken: cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
       await  _context.Users.AddAsync(user, cancellationToken);
    }
}