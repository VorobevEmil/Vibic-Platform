using Microsoft.EntityFrameworkCore;
using UserService.Core.Entities;
using Vibic.Shared.Core;

namespace UserService.Infrastructure.Data;

public class ApplicationDbContext : SharedDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
}