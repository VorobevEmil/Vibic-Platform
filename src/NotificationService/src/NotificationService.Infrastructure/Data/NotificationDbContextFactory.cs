using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql;

namespace NotificationService.Infrastructure.Data;

public class NotificationDbContextFactory : IDesignTimeDbContextFactory<NotificationDbContext>
{
    public NotificationDbContext CreateDbContext(string[] args)
    {
        var dataSource = new NpgsqlDataSourceBuilder(
            "Host=localhost;Port=5432;Database=vibic;Username=postgres;Password=postgres;Search Path=notifications")
            .EnableDynamicJson()
            .Build();

        var options = new DbContextOptionsBuilder<NotificationDbContext>()
            .UseNpgsql(dataSource, opt =>
            {
                opt.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                opt.MigrationsHistoryTable("__EFMigrationsHistory", "notifications");
            })
            .Options;

        return new NotificationDbContext(options);
    }
}
