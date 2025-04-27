using ChatChannelService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChatChannelService.Infrastructure.Data.Configurations;

public class ChatUserConfiguration : IEntityTypeConfiguration<ChatUser>
{
    public void Configure(EntityTypeBuilder<ChatUser> builder)
    {
        builder.HasKey(c => c.Id);
        
        builder.Property(c => c.DisplayName)
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(c => c.Username)
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(cu => cu.AvatarUrl)
            .IsRequired();

        builder.HasMany(c => c.ServerMembers)
            .WithOne(c => c.ChatUser)
            .HasForeignKey(c => c.ChatUserId);
        
        builder.HasMany(c => c.Messages)
            .WithOne(c => c.Sender)
            .HasForeignKey(c => c.SenderId);
    }
}