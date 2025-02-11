using System.Security.Claims;
using System.Web;
using AuthService.BackgroundService;
using AuthService.Data;
using AuthService.Helpers.EFCore.OAuth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Server.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
{
    builder.Services.AddControllers();
    builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
        .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
        {
            options.LoginPath = "/sign-in";
        });
    builder.Services.AddAuthorization();
    
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
            options.AllowAuthorizationCodeFlow()
                .RequireProofKeyForCodeExchange();

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
app.UseRouting();
app.MapGet("/sign-in", async context =>
{
    var html = @"
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Sign In</title>
    </head>
    <body>
        <h2>Sign In</h2>
        <form action='/sign-in' method='post'>
            <label for='username'>Username:</label>
            <input type='text' id='username' name='username' required>
            <br>
            <label for='email'>Email:</label>
            <input type='email' id='email' name='email' required>
            <br>
            <button type='submit'>Sign In</button>
        </form>
    </body>
    </html>";

    context.Response.ContentType = "text/html";
    await context.Response.WriteAsync(html);
});

app.MapPost("/sign-in", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync();
    string username = form["username"]!;
    string email = form["email"]!;
    
    List<Claim> claims =
    [
        new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), // Обязательный параметр
        new(ClaimTypes.Name, username),
        new(ClaimTypes.Email, email)
    ];  
    
    
    ClaimsPrincipal principal = new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme));
    
    await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
    
    string referer = context.Request.Headers.Referer.ToString();
    string queryParam = "ReturnUrl=";
    string returnUrl = referer.Remove(0, referer.IndexOf(queryParam, StringComparison.Ordinal) + queryParam.Length);
    returnUrl = HttpUtility.UrlDecode(returnUrl);
    
    if (string.IsNullOrEmpty(returnUrl))
    {
        returnUrl = "/"; // Перенаправляем на главную страницу, если returnUrl отсутствует
    }

    return Results.Redirect(returnUrl);
});
app.UseCookiePolicy();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();