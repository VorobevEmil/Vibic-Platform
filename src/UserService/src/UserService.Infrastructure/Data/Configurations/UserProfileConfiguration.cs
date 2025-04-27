using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UserService.Core.Entities;
using UserService.Core.Enums;

namespace UserService.Infrastructure.Data.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.DisplayName)
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(x => x.Username)
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(x => x.Email)
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(x => x.Status).HasDefaultValue(UserStatus.Offline);
    }
}