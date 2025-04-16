namespace ApiGateway.Web;

public static class DependencyInjection
{
    public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(actions =>
        {
            actions.AddPolicy("accessPolicy", builder => builder
                .SetIsOriginAllowed(_ => true)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());
        });

        return services;
    }


}