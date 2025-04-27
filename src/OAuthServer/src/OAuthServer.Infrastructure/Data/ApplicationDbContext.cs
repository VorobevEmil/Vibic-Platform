using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using OAuthServer.Core.Entities;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.Core;
using Vibic.Shared.EF;

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.UseOpenIddict();
    }
}