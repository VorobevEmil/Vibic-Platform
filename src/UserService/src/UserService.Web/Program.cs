using Microsoft.AspNetCore.HttpOverrides;
using Scalar.AspNetCore;
using UserService.Application;
using UserService.Infrastructure;
using UserService.Infrastructure.Data;
using UserService.Web.Hubs;
using Vibic.Shared.Core;
using Vibic.Shared.EF;
using Vibic.Shared.Messaging;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
{
    builder.Services
        .AddApplication()
        .AddInfrastructure(builder.Configuration);

    builder.Services.AddExceptionHandlers();
    builder.Services.AddAuthorization();
    builder.Services.AddVibicAuthentication();
    builder.Services.AddVibicTelemetry();
    builder.Services.AddCorrelationId();
    builder.Services.AddControllersConfiguration();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddOutboxPublisher();
    builder.Host.AddVibicMessaging();
    builder.Services.AddSignalR();
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor
                                   | ForwardedHeaders.XForwardedHost
                                   | ForwardedHeaders.XForwardedProto;
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
    });
}
WebApplication app = builder.Build();
{
    app.UseForwardedHeaders();
    app.ApplyMigration<ApplicationDbContext>();

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

    app.MapHub<PresenceHub>("/hubs/presence");

    app.Run();
}
