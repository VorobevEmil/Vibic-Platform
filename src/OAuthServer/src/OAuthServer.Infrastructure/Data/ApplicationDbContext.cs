using Microsoft.EntityFrameworkCore;
using OAuthServer.Core.Entities;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.EF;
using Vibic.Shared.EF.Entities;

namespace OAuthServer.Infrastructure.Data;

public class ApplicationDbContext : SharedDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<OpenIddictEntityFrameworkCoreApplication> OpenIddictApplications =>
        Set<OpenIddictEntityFrameworkCoreApplication>();

    public DbSet<OpenIddictEntityFrameworkCoreAuthorization> OpenIddictAuthorizations =>
        Set<OpenIddictEntityFrameworkCoreAuthorization>();

    public DbSet<OpenIddictEntityFrameworkCoreScope> OpenIddictScopes => Set<OpenIddictEntityFrameworkCoreScope>();
    public DbSet<OpenIddictEntityFrameworkCoreToken> OpenIddictTokens => Set<OpenIddictEntityFrameworkCoreToken>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserProvider> UserProvider => Set<UserProvider>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.UseOpenIddict();
    }
}
