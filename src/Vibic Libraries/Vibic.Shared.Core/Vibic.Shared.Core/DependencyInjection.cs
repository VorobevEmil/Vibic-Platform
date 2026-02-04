using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Vibic.Shared.Core.ExceptionHandlers;
using Vibic.Shared.Core.Interfaces;
using Vibic.Shared.Core.Providers;

namespace Vibic.Shared.Core;

public static class DependencyInjection
{
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
        IConfiguration configuration,
        JwtBearerEvents? events = null)
    {
        string keyString = configuration["Authentication:Jwt:Key"] ?? string.Empty;
        SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(keyString));

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
                    ValidIssuer = configuration["Authentication:Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = configuration["Authentication:Jwt:Audience"],
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key
                };

                string? authority = configuration["Authentication:Authority"];
                if (!string.IsNullOrWhiteSpace(authority))
                {
                    options.Authority = authority;
                    options.RequireHttpsMetadata = false;
                }
            });
    }

    public static IServiceCollection AddUtcTimeProvider(this IServiceCollection services)
    {
        services.AddSingleton<IUtcTimeProvider, UtcTimeProvider>();
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