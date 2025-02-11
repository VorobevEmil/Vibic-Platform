using System.Security.Claims;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace AuthService.Controllers;

[ApiController]
public class AuthorizationController : ControllerBase
{
    [HttpGet("~/connect/authorize")]
    public IActionResult Authorize()
    {
        var request = HttpContext.GetOpenIddictServerRequest();
        if (request == null)
        {
            return BadRequest("Invalid OpenID Connect request.");
        }

        // Если пользователь не аутентифицирован, отправляем его на страницу входа
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Challenge(new AuthenticationProperties { RedirectUri = "https://localhost:7296/" });
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

// Включить все claims в access token
        foreach (var claim in principal.Claims)
        {
            if (claim.Type == OpenIddictConstants.Claims.Name || claim.Type == OpenIddictConstants.Claims.Email)
            {
                claim.SetDestinations(OpenIddictConstants.Destinations.IdentityToken);
            }
            else
            {
                claim.SetDestinations(OpenIddictConstants.Destinations.AccessToken);
            }
        }

        // Добавляем разрешенные области (scopes), если они есть в запросе
        principal.SetScopes(OpenIddictConstants.Scopes.OpenId, OpenIddictConstants.Scopes.Profile,
            OpenIddictConstants.Scopes.Email);
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
            var claimsPrincipal =
                (await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme))
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

        if (request.IsAuthorizationCodeGrantType())
        {
            var result = await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            if (!result.Succeeded)
            {
                return Forbid(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            }

            var claims = result.Principal.Claims.ToList();
            
            var identity = new ClaimsIdentity(claims, TokenValidationParameters.DefaultAuthenticationType,
                OpenIddictConstants.Claims.Name, OpenIddictConstants.Claims.Role);

            // Создание нового ClaimsPrincipal с обновленным набором данных
            var principal = new ClaimsPrincipal(identity);
            principal.SetScopes(result.Principal.GetScopes());

            foreach (var claim in principal.Claims)
            {
                if (claim.Type == OpenIddictConstants.Claims.Name || claim.Type == OpenIddictConstants.Claims.Email)
                {
                    claim.SetDestinations(OpenIddictConstants.Destinations.AccessToken);
                }
            }
            
            return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        throw new NotImplementedException("The specified grant type is not implemented.");
    }

    [Authorize(AuthenticationSchemes = OpenIddictServerAspNetCoreDefaults.AuthenticationScheme)]
    [HttpGet("~/connect/userinfo"), HttpPost("~/connect/userinfo")]
    public IActionResult GetUserInfo()
    {
        var claims = new Dictionary<string, object>(StringComparer.Ordinal)
        {
            // Note: the "sub" claim is a mandatory claim and must be included in the JSON response.
            [OpenIddictConstants.Claims.Subject] = User.FindFirst(OpenIddictConstants.Claims.Subject)?.Value!,
            [OpenIddictConstants.Claims.Name] = User.FindFirst(OpenIddictConstants.Claims.Name)?.Value!,
            [OpenIddictConstants.Claims.Email] = User.FindFirst(OpenIddictConstants.Claims.Email)?.Value!,
        };

        // Note: the complete list of standard claims supported by the OpenID Connect specification
        // can be found here: http://openid.net/specs/openid-connect-core-1_0.html#StandardClaims

        return Ok(claims);
    }
}