using ApiGateway.Web;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
{
    builder.Configuration
        .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true)
        .AddJsonFile($"ocelot.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

    builder.Services.AddOcelot(builder.Configuration);
    builder.Services.AddCorsPolicy();
}
WebApplication app = builder.Build();
{
    app.UseCors("accessPolicy");
    await app.UseOcelot();
    app.Run();
}
