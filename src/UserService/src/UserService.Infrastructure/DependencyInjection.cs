using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using UserService.Application.Repositories;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.Repositories;
using Vibic.Shared.Core.Interfaces;

namespace UserService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddApplicationDbContext();
        services.AddRepositories();
        return services;
    }

    private static IServiceCollection AddApplicationDbContext(this IServiceCollection services)
    {
        IConfiguration configuration = services.BuildServiceProvider().GetService<IConfiguration>()!;
        string? databaseConnection = configuration.GetConnectionString("Postgres");
        NpgsqlDataSource dataSourceBuilder = new NpgsqlDataSourceBuilder(databaseConnection)
            .EnableDynamicJson()
            .Build();

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(dataSourceBuilder,
                opt => opt.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        return services;
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        return services;
    }
}