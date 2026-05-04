using Microsoft.EntityFrameworkCore;
using NotificationService.Core.Entities;
using Vibic.Shared.EF;

namespace NotificationService.Infrastructure.Data;

public class NotificationDbContext : SharedDbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options)
    {
    }

    public DbSet<Notification> Notifications => Set<Notification>();
}
