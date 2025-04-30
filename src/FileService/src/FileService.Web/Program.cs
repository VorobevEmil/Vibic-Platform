using FileService.Application;
using FileService.Infrastructure;
using Scalar.AspNetCore;
using Vibic.Shared.Core;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
{
    builder.Services
        .AddApplication()
        .AddInfrastructure(builder.Configuration);

    builder.Services.AddExceptionHandlers();
    builder.Services.AddControllersConfiguration();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();
}
WebApplication app = builder.Build();
{
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseExceptionHandler();
    app.MapControllers();

    app.Run();
}