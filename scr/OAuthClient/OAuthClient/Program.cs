using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using OpenIddict.Client;
using OpenIddict.Client.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = OpenIddictClientAspNetCoreDefaults.AuthenticationScheme;
    })
    .AddCookie();

builder.Services.AddControllers();

builder.Services.AddAuthorization();

builder.Services.AddOpenIddict()
    .AddClient(options =>
    {
        options.DisableTokenStorage();
        // Allow grant_type=client_credentials to be negotiated.
        options.AllowAuthorizationCodeFlow();

        options.UseSystemNetHttp();

        // Add a client registration with the client identifier and secrets issued by the server.
        options.AddRegistration(new OpenIddictClientRegistration
        {
            Issuer = new Uri("https://localhost:7153/", UriKind.Absolute),
            ClientId = "vibic_client",
            ClientSecret = "vibic_secret",
            RedirectUri = new Uri("https://localhost:7296/callback", UriKind.Absolute),
            Scopes = { "openid", "profile", "email" }
        });

        options.UseAspNetCore()
            .EnableRedirectionEndpointPassthrough()
            .EnablePostLogoutRedirectionEndpointPassthrough();

        options.AddDevelopmentSigningCertificate();
        options.AddDevelopmentEncryptionCertificate();
    });

var app = builder.Build();
app.UseForwardedHeaders();

app.MapGet("/", () => "Hello World!");
app.MapGet("/profile", async (context) => await context.Response.WriteAsJsonAsync(context.User.Claims
    .ToDictionary(x => x.Type, x => x.Value))
).RequireAuthorization();
app.MapGet("/login",
    () => Results.Challenge(new AuthenticationProperties(), [OpenIddictClientAspNetCoreDefaults.AuthenticationScheme]));

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();