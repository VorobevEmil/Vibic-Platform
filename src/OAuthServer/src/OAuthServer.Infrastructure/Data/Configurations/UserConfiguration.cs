using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OAuthServer.Core.Entities;

namespace OAuthServer.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Username)
            .IsRequired();
        builder.Property(x => x.Email)
            .IsRequired();
        builder.Property(x => x.PasswordHash)
            .IsRequired();
    }
}