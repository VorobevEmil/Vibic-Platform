using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using OAuthServer.Core.Entities;
using OpenIddict.EntityFrameworkCore.Models;

namespace OAuthServer.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public DbSet<OpenIddictEntityFrameworkCoreApplication> OpenIddictApplications =>
        Set<OpenIddictEntityFrameworkCoreApplication>();

    public DbSet<OpenIddictEntityFrameworkCoreAuthorization> OpenIddictAuthorizations =>
        Set<OpenIddictEntityFrameworkCoreAuthorization>();

    public DbSet<OpenIddictEntityFrameworkCoreScope> OpenIddictScopes => Set<OpenIddictEntityFrameworkCoreScope>();
    public DbSet<OpenIddictEntityFrameworkCoreToken> OpenIddictTokens => Set<OpenIddictEntityFrameworkCoreToken>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserProvider> UserProvider => Set<UserProvider>();

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ValueConverter<DateTimeOffset, DateTime> utcConverter = new ValueConverter<DateTimeOffset, DateTime>(
            toDb => toDb.UtcDateTime,
            fromDb => new DateTimeOffset(DateTime.SpecifyKind(fromDb, DateTimeKind.Utc))
        );

        foreach (IMutableEntityType entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (IMutableProperty property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTimeOffset))
                {
                    property.SetValueConverter(utcConverter);
                }
            }
        }


        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        modelBuilder.UseOpenIddict();
    }
}