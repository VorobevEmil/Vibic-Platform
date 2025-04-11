using Microsoft.EntityFrameworkCore;
using UserService.Core.Entities;

namespace UserService.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}