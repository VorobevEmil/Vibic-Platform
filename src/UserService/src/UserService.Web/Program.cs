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
        .AddInfrastructure();

    builder.Services.AddExceptionHandlers();
    builder.Services.AddAuthorization();
    builder.Services.AddVibicAuthentication();
    builder.Services.AddControllersConfiguration();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddRabbitMq();
    builder.Services.AddSignalR();
}
WebApplication app = builder.Build();
{
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


    app.UseExceptionHandler();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    
    app.MapHub<PresenceHub>("/hubs/presence");

    app.Run();
}