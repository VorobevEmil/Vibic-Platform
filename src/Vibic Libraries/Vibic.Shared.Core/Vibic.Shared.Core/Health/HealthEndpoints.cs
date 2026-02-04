using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Vibic.Shared.Core.Health;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/health", async (
            HttpContext context,
            HealthCheckService healthCheckService,
            IConfiguration configuration) =>
        {
            HealthReport report = await healthCheckService.CheckHealthAsync(context.RequestAborted);

            Assembly entryAssembly = Assembly.GetEntryAssembly()!;
            string serviceName = entryAssembly.GetName().Name ?? "Unknown";
            string version = entryAssembly.GetName().Version?.ToString() ?? "unknown";
            string informational = entryAssembly
                .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? "unknown";

            string env = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Unknown";

            HealthInfo healthInfo = new(
                Status: report.Status.ToString(),
                Service: serviceName,
                Environment: env,
                Version: new VersionInfo(
                    Semver: version,
                    InformationalVersion: informational,
                    AssemblyVersion: version),
                Timestamp: DateTime.UtcNow);

            return report.Status == HealthStatus.Healthy
                ? Results.Ok(healthInfo)
                : Results.Json(healthInfo, statusCode: StatusCodes.Status503ServiceUnavailable);
        }).WithTags("Health");

        endpoints.MapHealthChecks("/health/live", new()
        {
            Predicate = _ => false
        });

        endpoints.MapHealthChecks("/health/ready");

        return endpoints;
    }
}
