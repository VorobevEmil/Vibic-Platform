using Microsoft.AspNetCore.Authentication.JwtBearer;
using NotificationService.Application;
using NotificationService.Application.Services;
using NotificationService.Infrastructure;
using NotificationService.Infrastructure.Data;
using NotificationService.Web.Hubs;
using NotificationService.Web.Services;
using Scalar.AspNetCore;
using Vibic.Shared.Core;
using Vibic.Shared.EF;
using Vibic.Shared.Messaging;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
{
    builder.Services
        .AddApplication()
        .AddInfrastructure();

    builder.Services.AddExceptionHandlers();
    builder.Services.AddVibicAuthentication(new JwtBearerEvents()
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Path.StartsWithSegments("/hubs"))
            {
                context.Token = context.Request.Query["access_token"];
            }

            return Task.CompletedTask;
        }
    });
    builder.Services.AddAuthorization();
    builder.Services.AddVibicTelemetry();
    builder.Services.AddCorrelationId();
    builder.Services.AddControllersConfiguration();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();
    builder.Services.AddHttpContextAccessor();
    builder.Host.AddVibicMessaging();
    builder.Services.AddSignalR();
    builder.Services.AddScoped<INotificationPushService, SignalRNotificationPushService>();
}
WebApplication app = builder.Build();
{
    app.ApplyMigration<NotificationDbContext>();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseCors(p => p
        .SetIsOriginAllowed(_ => true)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());

    app.UseCorrelationId();
    app.UseExceptionHandler();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHub<NotificationHub>("/hubs/notifications");

    app.Run();
}
