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
                //specify token endpoint uri
                options.SetTokenEndpointUris("connect/token")
                    .SetIntrospectionEndpointUris("connect/token/introspect")
                    .SetRevocationEndpointUris("connect/token/revoke")
                    .SetAuthorizationEndpointUris("connect/authorize")
                    .SetUserInfoEndpointUris("connect/userinfo");
                
                options.RegisterScopes("openid", "profile", "email");

                options.AllowClientCredentialsFlow();
                options.AllowRefreshTokenFlow();
                options.AllowAuthorizationCodeFlow();
                
                //secret registration
                options.AddDevelopmentEncryptionCertificate()
                    .AddDevelopmentSigningCertificate();
                options.DisableAccessTokenEncryption();
                
                options.UseAspNetCore()
                    .EnableTokenEndpointPassthrough()
                    .EnableAuthorizationEndpointPassthrough()
                    .EnableTokenEndpointPassthrough()
                    .EnableUserInfoEndpointPassthrough();

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