using OAuthServer.Application;
using OAuthServer.Infrastructure;
using OAuthServer.Web;
using Scalar.AspNetCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
{
    builder.Services
        .AddApplication()
        .AddInfrastructure(builder.Configuration);

    builder.Services.AddExceptionHandlers();
    builder.Services.AddCookieAuthentication();
    builder.Services.AddAuthorization();
    builder.Services.AddOpenIdDictServer();
    builder.Services.AddControllersConfiguration();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddReact();
}
WebApplication app = builder.Build();
{
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseStaticFiles();
    app.UseSpaStaticFiles();
    app.UseRouting();
    app.UseExceptionHandler();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.UseReact();
    app.Run();
}