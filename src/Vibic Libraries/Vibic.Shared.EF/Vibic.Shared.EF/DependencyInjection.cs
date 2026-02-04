using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Npgsql;
using Vibic.Shared.Core;
using Vibic.Shared.EF.Interfaces;
using Vibic.Shared.EF.Options;
using Vibic.Shared.EF.Repositories;

namespace Vibic.Shared.EF;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationDbContext<TDbContext>(
        this IServiceCollection services)
        where TDbContext : SharedDbContext
    {
        services.AddOptionsWithValidateAndBind<PostgresOptions, PostgresOptionsValidator>();

        using ServiceProvider sp = services.BuildServiceProvider();
        PostgresOptions postgresOptions = sp.GetRequiredService<IOptions<PostgresOptions>>().Value;

        NpgsqlDataSource dataSourceBuilder = new NpgsqlDataSourceBuilder(postgresOptions.Postgres)
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
