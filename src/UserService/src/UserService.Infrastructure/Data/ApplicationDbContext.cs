using Microsoft.EntityFrameworkCore;
using UserService.Core.Entities;
using Vibic.Shared.EF;

namespace UserService.Infrastructure.Data;

public class ApplicationDbContext : SharedDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<FriendRequest> FriendRequests => Set<FriendRequest>();
    public DbSet<UserFriend> UserFriends => Set<UserFriend>();
}