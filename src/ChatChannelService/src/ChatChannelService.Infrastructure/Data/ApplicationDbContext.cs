using ChatChannelService.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Vibic.Shared.Core;

namespace ChatChannelService.Infrastructure.Data;

public class ApplicationDbContext : SharedDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Channel> Channels => Set<Channel>();
    public DbSet<ChannelMember> ChannelMembers => Set<ChannelMember>();
    public DbSet<ChatUser> ChatUsers => Set<ChatUser>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Server> Servers => Set<Server>();
    public DbSet<ServerMember> ServerMembers => Set<ServerMember>();
}