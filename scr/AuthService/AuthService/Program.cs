using AuthService.BackgroundService;
using AuthService.Data;
using AuthService.Helpers.EFCore;
using AuthService.Helpers.EFCore.OAuth;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
{
    builder.Services.AddControllers();

    builder.Services.AddOpenIddict()
        .AddCore(options =>
        {
            options.UseEntityFrameworkCore()
                .ReplaceWithCustomOAuthEntities()
                .UseDbContext<ApplicationDbContext>();
        })
        .AddServer(options =>
        {
            options.AllowClientCredentialsFlow();
            //specify token endpoint uri
            options.SetTokenEndpointUris("token");
            options.SetIntrospectionEndpointUris("token/introspect");
            options.SetRevocationEndpointUris("token/revoke");

            //secret registration
            options.AddDevelopmentEncryptionCertificate()
                .AddDevelopmentSigningCertificate();
            options.DisableAccessTokenEncryption();
            //the asp request handlers configuration itself

            options.AllowRefreshTokenFlow();

            options.UseAspNetCore().EnableTokenEndpointPassthrough();
        })
        .AddValidation(options =>
        {
            options.UseLocalServer();
            options.UseAspNetCore();
        });

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseNpgsql(builder.Configuration.GetConnectionString("Database"));
        options.UseCustomOAuth();
    });

    builder.Services.AddHostedService<ClientSeeder>();
}

var app = builder.Build();
app.UseAuthentication();
app.MapControllers();
app.Run();