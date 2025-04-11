using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;

namespace OAuthServer.Web;

public static class WebApplicationExtensions
{
    private static readonly string[] Paths = ["/scalar", "/openapi", "/api"];

    public static WebApplication UseReact(this WebApplication app)
    {
        app.UseWhen(context => Paths
            .All(path => !context.Request.Path.StartsWithSegments(path)), appBuilder =>
        {
            appBuilder.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";
                if (app.Environment.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        });

        return app;
    }
}