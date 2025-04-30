using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Vibic.Shared.EF.Interfaces;
using Vibic.Shared.EF.Repositories;

namespace Vibic.Shared.EF;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationDbContext<TDbContext>(this IServiceCollection services)
        where TDbContext : SharedDbContext
    {
        IConfiguration configuration = services.BuildServiceProvider().GetService<IConfiguration>()!;
        string? databaseConnection = configuration.GetConnectionString("Postgres");
        NpgsqlDataSource dataSourceBuilder = new NpgsqlDataSourceBuilder(databaseConnection)
            .EnableDynamicJson()
            .Build();

        services.AddDbContext<TDbContext>(options =>
            options.UseNpgsql(dataSourceBuilder,
                opt => opt.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        services.AddScoped<IUnitOfWork, UnitOfWork<TDbContext>>();

        return services;
    }

    public static WebApplication ApplyMigration<TDbContext>(this WebApplication app) where TDbContext : SharedDbContext
    {
        using AsyncServiceScope scope = app.Services.CreateAsyncScope();
        IServiceProvider serviceProvider = scope.ServiceProvider;
        TDbContext db = serviceProvider.GetRequiredService<TDbContext>();
        db.Database.Migrate();

        return app;
    }
}