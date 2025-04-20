using MediaService.Web.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Vibic.Shared.Core;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
{
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
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddSignalR();
}

WebApplication app = builder.Build();
{
    app.UseCors(p => p
        .SetIsOriginAllowed(_ => true)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());

    app.UseExceptionHandler();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHub<CallHub>("/hubs/call");

    app.Run();
}