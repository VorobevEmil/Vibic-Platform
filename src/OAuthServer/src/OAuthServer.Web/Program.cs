using OAuthServer.Application;
using OAuthServer.Infrastructure;
using OAuthServer.Web;
using Scalar.AspNetCore;
using Vibic.Shared.Core;
using Vibic.Shared.Messaging;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
{
    builder.Services
        .AddApplication()
        .AddInfrastructure();

    builder.Services.AddExceptionHandlers();
    builder.Services.AddCookieAuthentication();
    builder.Services.AddAuthorization();
    builder.Services.AddOpenIdDictServer();
    builder.Services.AddControllersConfiguration();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddRabbitMq();
    builder.Services.AddCors();
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


    app.UseRouting();
    app.UseExceptionHandler();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.Run();
}