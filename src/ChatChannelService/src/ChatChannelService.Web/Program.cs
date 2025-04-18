using ChatChannelService.Application;
using ChatChannelService.Infrastructure;
using ChatChannelService.Web.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Scalar.AspNetCore;
using Vibic.Shared.Core;
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
    builder.Services.AddControllersConfiguration();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddRabbitMq();
    builder.Services.AddSignalR();
}
WebApplication app = builder.Build();
{
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

    app.UseExceptionHandler();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHub<ChatHub>("/hubs/chat");

    app.Run();
}