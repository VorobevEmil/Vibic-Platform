using System.Security.Claims;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OAuthServer.Application.Interfaces;
using OAuthServer.Application.Interfaces.OpenId;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace OAuthServer.Web.Controllers;

[ApiController]
[Route("api/connect")]
public class ConnectController : ControllerBase
{
    private readonly IOpenIdAuthorizationService _openIdAuthorizationService;
    private readonly IOpenIdTokenService _ioAuthTokenService;
    private readonly IOpenIdUserService _ioAuthUserService;

    public ConnectController(
        IOpenIdAuthorizationService openIdAuthorizationService,
        IOpenIdTokenService ioAuthTokenService,
        IOpenIdUserService ioAuthUserService)
    {
        _openIdAuthorizationService = openIdAuthorizationService;
        _ioAuthTokenService = ioAuthTokenService;
        _ioAuthUserService = ioAuthUserService;
    }

    [HttpGet("authorize")]
    public IActionResult Authorize()
    {
        OpenIddictRequest? request = HttpContext.GetOpenIddictServerRequest();
        if (request == null)
            return BadRequest("Invalid OpenID Connect request.");

        ClaimsPrincipal principal = _openIdAuthorizationService.Authorize(User, request);
        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    [HttpPost("token")]
    public async Task<IActionResult> Exchange()
    {
        OpenIddictRequest request = HttpContext.GetOpenIddictServerRequest() ??
                                    throw new InvalidOperationException("Invalid OpenID Connect request.");

        ClaimsPrincipal principal = await _ioAuthTokenService.ExchangeTokenAsync(request, HttpContext);
        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    [Authorize(AuthenticationSchemes = OpenIddictServerAspNetCoreDefaults.AuthenticationScheme)]
    [HttpGet("userinfo"), HttpPost("userinfo")]
    public IActionResult GetUserInfo()
    {
        Dictionary<string, object> claims = _ioAuthUserService.GetUserInfo(User);
        return Ok(claims);
    }
}