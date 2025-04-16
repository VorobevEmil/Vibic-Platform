using ChatChannelService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChatChannelService.Infrastructure.Data.Configurations;

public class ChannelMemberConfiguration : IEntityTypeConfiguration<ChannelMember>
{
    public void Configure(EntityTypeBuilder<ChannelMember> builder)
    {
        builder.HasKey(cm => new { cm.ChannelId, UserId = cm.ChatUserId }); 

        builder.HasOne(cm => cm.Channel)
            .WithMany(c => c.ChannelMembers)
            .HasForeignKey(cm => cm.ChannelId);

        builder.HasOne(cm => cm.ChatUser)
            .WithMany(u => u.ChannelMembers)
            .HasForeignKey(cm => cm.ChatUserId);
    }
}