using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql;

namespace ChatChannelService.Infrastructure.Data;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var dataSource = new NpgsqlDataSourceBuilder(
            "Host=localhost;Port=5432;Database=vibic;Username=postgres;Password=postgres;Search Path=chat")
            .EnableDynamicJson()
            .Build();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(dataSource, opt =>
            {
                opt.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                opt.MigrationsHistoryTable("__EFMigrationsHistory", "chat");
            })
            .Options;

        return new ApplicationDbContext(options);
    }
}
