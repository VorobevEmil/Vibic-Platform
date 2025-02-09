using System.Security.Claims;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace AuthService.Controllers;

[ApiController]
public class AuthorizationController : ControllerBase
{
    [HttpGet("~/connect/authorize")]
    public async Task<IActionResult> Authorize()
    {
        var request = HttpContext.GetOpenIddictServerRequest();
        if (request == null)
        {
            return BadRequest("Invalid OpenID Connect request.");
        }

        // Если пользователь не аутентифицирован, отправляем его на страницу входа
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Challenge(new AuthenticationProperties { RedirectUri = "/connect/authorize" });
        }

        // Создаём список клеймов (Claims) для пользователя
        List<Claim> claims =
        [
            new(OpenIddictConstants.Claims.Subject, User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? ""),
            new(OpenIddictConstants.Claims.Name, User.Identity.Name ?? ""),
            new(OpenIddictConstants.Claims.Email, User.FindFirst(ClaimTypes.Email)?.Value ?? "")
        ];

        // Создаём ClaimsIdentity с указанной схемой аутентификации
        var identity = new ClaimsIdentity(claims, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);

        // Создаём ClaimsPrincipal, который будет передан клиенту
        var principal = new ClaimsPrincipal(identity);

        // Добавляем разрешенные области (scopes), если они есть в запросе
        principal.SetScopes(OpenIddictConstants.Scopes.OpenId, OpenIddictConstants.Scopes.Profile, OpenIddictConstants.Scopes.Email);

        // Генерируем и возвращаем authorization code
        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    [HttpPost("~/connect/token")]
    public async Task<IActionResult> Exchange()
    {
        var request = HttpContext.GetOpenIddictServerRequest() ??
                      throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        if (request.IsRefreshTokenGrantType())
        {
            var claimsPrincipal = (await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme))
                .Principal!;

            return SignIn(claimsPrincipal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        if (request.IsClientCredentialsGrantType())
        {
            var clientId = request.ClientId;
            var identity = new ClaimsIdentity(authenticationType: TokenValidationParameters.DefaultAuthenticationType);

            identity.SetClaim(OpenIddictConstants.Claims.Subject, clientId);
            identity.SetScopes(request.GetScopes());
            var principal = new ClaimsPrincipal(identity);
            // Returning a SignInResult will ask OpenIddict to issue the appropriate access/identity tokens.
            return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        throw new NotImplementedException("The specified grant type is not implemented.");
    }
}