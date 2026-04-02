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

        NpgsqlConnectionStringBuilder csb = new(postgresOptions.Postgres);
        string[] schemas = GetSchemas(csb.SearchPath);

        services.AddDbContext<TDbContext>(options =>
            options.UseNpgsql(dataSourceBuilder,
                opt =>
                {
                    opt.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                    if (schemas.Length > 0)
                    {
                        opt.MigrationsHistoryTable("__EFMigrationsHistory", schemas[0]);
                    }
                }));

        services.AddScoped<IUnitOfWork, UnitOfWork<TDbContext>>();

        return services;
    }

    public static WebApplication ApplyMigration<TDbContext>(this WebApplication app) where TDbContext : SharedDbContext
    {
        using AsyncServiceScope scope = app.Services.CreateAsyncScope();
        IServiceProvider serviceProvider = scope.ServiceProvider;
        PostgresOptions postgresOptions = serviceProvider.GetRequiredService<IOptions<PostgresOptions>>().Value;
        NpgsqlConnectionStringBuilder csb = new(postgresOptions.Postgres);
        string[] schemas = GetSchemas(csb.SearchPath);
        if (schemas.Length > 0)
        {
            using NpgsqlConnection conn = new(csb.ConnectionString);
            conn.Open();
            foreach (string schema in schemas)
            {
                string safeSchema = schema.Replace("\"", "\"\"");
                using NpgsqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = $"CREATE SCHEMA IF NOT EXISTS \"{safeSchema}\"";
                cmd.ExecuteNonQuery();
            }
        }
        TDbContext db = serviceProvider.GetRequiredService<TDbContext>();
        db.Database.Migrate();

        return app;
    }

    public static IServiceCollection AddOutboxRepository<TDbContext>(this IServiceCollection services)
        where TDbContext : DbContext
    {
        services.AddScoped<IOutboxRepository, OutboxRepository<TDbContext>>();
        return services;
    }

    private static string[] GetSchemas(string? searchPath)
    {
        if (string.IsNullOrWhiteSpace(searchPath))
        {
            return [];
        }

        return searchPath
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToArray();
    }
}
