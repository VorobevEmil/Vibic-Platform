using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;
using OpenIddict.Client.AspNetCore;

namespace OAuthClient.Controllers;

[ApiController]
public class AuthorizationController : ControllerBase
{
    [HttpGet("~/callback")]
    [Authorize(AuthenticationSchemes = OpenIddictClientAspNetCoreDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Callback()
    {
        List<Claim> claims =
        [
            new(ClaimTypes.NameIdentifier, User.FindFirst(OpenIddictConstants.Claims.Subject)!.Value),
            new(ClaimTypes.Name, User.FindFirst(OpenIddictConstants.Claims.Name)!.Value),
            new(ClaimTypes.Email, User.FindFirst(OpenIddictConstants.Claims.Email)!.Value)
        ];

        ClaimsIdentity identity = new(claims, CookieAuthenticationDefaults.AuthenticationScheme);

        ClaimsPrincipal principal = new ClaimsPrincipal(identity);
        
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
        return Redirect("profile");
    }
}