using ChatChannelService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChatChannelService.Infrastructure.Data.Configurations;

public class ServerMemberConfiguration : IEntityTypeConfiguration<ServerMember>
{
    public void Configure(EntityTypeBuilder<ServerMember> builder)
    {
        builder.HasKey(sm => sm.Id);
        builder.HasOne(sm => sm.ChatUser)
            .WithMany(c => c.ServerMembers)
            .HasForeignKey(sm => sm.ChatUserId);
        builder.HasOne(sm => sm.Server)
            .WithMany(s => s.ServerMembers)
            .HasForeignKey(sm => sm.ServerId);

        builder.Property(sm => sm.DisplayName)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasMany(sm => sm.ServerRoles)
            .WithMany(r => r.ServerMembers);
    }
}