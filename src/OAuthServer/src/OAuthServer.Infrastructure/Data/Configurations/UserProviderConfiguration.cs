using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OAuthServer.Core.Entities;

namespace OAuthServer.Infrastructure.Data.Configurations;

public class UserProviderConfiguration : IEntityTypeConfiguration<UserProvider>
{
    public void Configure(EntityTypeBuilder<UserProvider> builder)
    {
        builder.HasKey(x => x.Id);
        builder.HasOne(x => x.User)
            .WithMany(x => x.UserProviders)
            .HasForeignKey(x => x.UserId)
            .IsRequired();
        builder.HasOne(x => x.OpenIddictOpenIddictApplication)
            .WithMany()
            .HasForeignKey(x => x.OpenIddictApplicationId)
            .IsRequired();
    }
}