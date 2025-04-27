using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Vibic.Shared.Core.ExceptionHandlers;

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
        JwtBearerEvents? events = null)
    {
        SymmetricSecurityKey key = new("super_secret_dummy_key_1234567890"u8.ToArray());

        return services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Events = events!;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = false,
                    IssuerSigningKey = key
                };
            });
    }
}