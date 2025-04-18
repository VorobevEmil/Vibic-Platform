using ChatChannelService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChatChannelService.Infrastructure.Data.Configurations;

public class ServerRoleConfiguration : IEntityTypeConfiguration<ServerRole>
{
    public void Configure(EntityTypeBuilder<ServerRole> builder)
    {
        builder.HasKey(sr => sr.Id);

        builder.HasOne(sr => sr.Server)
            .WithMany(s => s.ServerRoles)
            .HasForeignKey(sr => sr.ServerId);
        
        builder.Property(sr => sr.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasMany(sr => sr.ServerMembers)
            .WithMany(sm => sm.ServerRoles);
    }
}