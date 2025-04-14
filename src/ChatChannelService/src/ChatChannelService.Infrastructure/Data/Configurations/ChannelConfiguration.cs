using ChatChannelService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChatChannelService.Infrastructure.Data.Configurations;

public class ChannelConfiguration : IEntityTypeConfiguration<Channel>
{
    public void Configure(EntityTypeBuilder<Channel> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasOne(x => x.Server)
            .WithMany(x => x.Channels)
            .HasForeignKey(x => x.ServerId);
        
        builder.HasMany(x => x.Messages)
            .WithOne(x => x.Channel)
            .HasForeignKey(x => x.ChannelId);
    }
}