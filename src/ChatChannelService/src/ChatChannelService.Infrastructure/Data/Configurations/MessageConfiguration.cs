using ChatChannelService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChatChannelService.Infrastructure.Data.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.HasKey(m => m.Id);

        builder.HasOne(m => m.Channel)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ChannelId);
        
        builder.HasOne(m => m.ChatUser)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.SenderId);
        
        builder.Property(m => m.Content)
            .HasMaxLength(2000)
            .IsRequired();
    }
}