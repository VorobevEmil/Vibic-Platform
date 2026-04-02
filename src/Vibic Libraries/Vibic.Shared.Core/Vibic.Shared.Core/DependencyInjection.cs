using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Vibic.Shared.Core.ExceptionHandlers;
using Vibic.Shared.Core.Interfaces;
using Vibic.Shared.Core.Middleware;
using Vibic.Shared.Core.Providers;
using Vibic.Shared.Core.Services;
using Vibic.Shared.Core.Telemetry;
using AuthOptions = Vibic.Shared.Core.Options.AuthenticationOptions;
using AuthOptionsValidator = Vibic.Shared.Core.Options.AuthenticationOptionsValidator;

namespace Vibic.Shared.Core;

public static class DependencyInjection
{
    public static void AddOptionsWithValidateAndBind<TOptions, TOptionsValidator>(
        this IServiceCollection services)
        where TOptions : class, IAppOptions
        where TOptionsValidator : class, IValidateOptions<TOptions>
    {
        services
            .AddOptionsWithValidateOnStart<TOptions, TOptionsValidator>()
            .BindConfiguration(TOptions.ConfigSectionName);
    }

    public static IServiceCollection AddExceptionHandlers(this IServiceCollection services)
    {
        services.AddProblemDetails(o =>
        {
            o.CustomizeProblemDetails = context =>
            {
                ProblemDetails problemDetails = context.ProblemDetails;
                HttpContext httpContext = context.HttpContext;
                HttpRequest httpRequest = httpContext.Request;
                problemDetails.Instance = $"{httpRequest.Method} {httpRequest.Path}";
                problemDetails.Extensions.Add("requestId", httpContext.TraceIdentifier);
            };
        });
        services.AddExceptionHandler<GlobalExceptionHandler>();

        return services;
    }

    public static IServiceCollection AddControllersConfiguration(this IServiceCollection services)
    {
        services.AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    ModelStateDictionary modelState = context.ModelState;

                    string details = string.Join(" ", modelState.Values
                        .SelectMany(x => x.Errors)
                        .Select(x => x.ErrorMessage));

                    throw new ValidationException(details);
                };
            });

        return services;
    }

    public static AuthenticationBuilder AddVibicAuthentication(
        this IServiceCollection services,
        JwtBearerEvents? events = null)
    {
        services.AddOptionsWithValidateAndBind<AuthOptions, AuthOptionsValidator>();

        using ServiceProvider sp = services.BuildServiceProvider();
        AuthOptions authOptions = sp.GetRequiredService<IOptions<AuthOptions>>().Value;

        SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(authOptions.Jwt.Key));

        return services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                if (events != null)
                {
                    options.Events = events;
                }

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = authOptions.Jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = authOptions.Jwt.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    NameClaimType = ClaimTypes.NameIdentifier
                };

                if (!string.IsNullOrWhiteSpace(authOptions.Authority))
                {
                    options.Authority = authOptions.Authority;
                    options.RequireHttpsMetadata = false;
                }
            });
    }

    public static IServiceCollection AddUtcTimeProvider(this IServiceCollection services)
    {
        services.AddSingleton<IUtcTimeProvider, UtcTimeProvider>();
        return services;
    }

    public static IServiceCollection AddCorrelationId(this IServiceCollection services)
    {
        services.AddScoped<ICorrelationIdAccessor, CorrelationIdAccessor>();
        services.AddTransient<CorrelationIdForwardingHandler>();
        return services;
    }

    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
    {
        app.UseMiddleware<CorrelationIdMiddleware>();
        return app;
    }

    public static IServiceCollection AddVibicTelemetry(this IServiceCollection services)
    {
        services.AddOptionsWithValidateAndBind<TelemetryOptions, TelemetryOptionsValidator>();

        using ServiceProvider sp = services.BuildServiceProvider();
        TelemetryOptions options = sp.GetRequiredService<IOptions<TelemetryOptions>>().Value;

        ResourceBuilder resource = ResourceBuilder.CreateDefault().AddService(options.ServiceName);

        services.AddOpenTelemetry()
            .WithTracing(builder =>
            {
                builder
                    .SetResourceBuilder(resource)
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation();

                if (!string.IsNullOrWhiteSpace(options.OtlpEndpoint))
                    builder.AddOtlpExporter(o => o.Endpoint = new Uri(options.OtlpEndpoint));
            })
            .WithMetrics(builder =>
            {
                builder
                    .SetResourceBuilder(resource)
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();

                if (!string.IsNullOrWhiteSpace(options.OtlpEndpoint))
                    builder.AddOtlpExporter(o => o.Endpoint = new Uri(options.OtlpEndpoint));
            });

        return services;
    }

    public static IServiceCollection AddVibicHealthChecks(
        this IServiceCollection services,
        Action<IHealthChecksBuilder>? configure = null)
    {
        IHealthChecksBuilder builder = services.AddHealthChecks();
        configure?.Invoke(builder);
        return services;
    }

}
