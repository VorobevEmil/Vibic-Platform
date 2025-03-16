using System.Security.Claims;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OAuthServer.Application.Interfaces;
using OAuthServer.Application.Interfaces.OpenIdDict;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace OAuthServer.Web.Controllers;

[ApiController]
[Route("api/connect")]
public class ConnectController : ControllerBase
{
    private readonly IOpenIdDictAuthorizationService _openIdDictAuthorizationService;
    private readonly IOpenIdDictTokenService _ioAuthTokenService;
    private readonly IOpenIdDictUserService _ioAuthUserService;

    public ConnectController(
        IOpenIdDictAuthorizationService openIdDictAuthorizationService,
        IOpenIdDictTokenService ioAuthTokenService,
        IOpenIdDictUserService ioAuthUserService)
    {
        _openIdDictAuthorizationService = openIdDictAuthorizationService;
        _ioAuthTokenService = ioAuthTokenService;
        _ioAuthUserService = ioAuthUserService;
    }

    [HttpGet("authorize")]
    public IActionResult Authorize()
    {
        OpenIddictRequest? request = HttpContext.GetOpenIddictServerRequest();
        if (request == null)
            return BadRequest("Invalid OpenID Connect request.");

        ClaimsPrincipal principal = _openIdDictAuthorizationService.Authorize(User, request);
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