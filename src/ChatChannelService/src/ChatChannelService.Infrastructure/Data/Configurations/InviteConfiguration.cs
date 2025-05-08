using ChatChannelService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChatChannelService.Infrastructure.Data.Configurations;

public class InviteConfiguration : IEntityTypeConfiguration<Invite>
{
    public void Configure(EntityTypeBuilder<Invite> builder)
    {
        builder.HasKey(i => i.Id);
        
        builder.Property(i => i.Code)
            .HasMaxLength(32)
            .IsRequired();

        builder.HasOne(i => i.Server)
            .WithMany(s => s.Invites);
    }
}