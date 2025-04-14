using ChatChannelService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChatChannelService.Infrastructure.Data.Configurations;

public class ChannelMemberConfiguration : IEntityTypeConfiguration<ChannelMember>
{
    public void Configure(EntityTypeBuilder<ChannelMember> builder)
    {
        builder.HasKey(cm => new { cm.ChannelId, cm.UserId }); 

        builder.HasOne(cm => cm.Channel)
            .WithMany(c => c.ChannelMembers)
            .HasForeignKey(cm => cm.ChannelId);

        builder.HasOne(cm => cm.User)
            .WithMany(u => u.ChannelMembers)
            .HasForeignKey(cm => cm.UserId);
    }
}