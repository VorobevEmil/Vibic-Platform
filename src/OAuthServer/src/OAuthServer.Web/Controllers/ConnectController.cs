using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OAuthServer.Application.Features.OpenIdFeatures.Commands;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using Vibic.Shared.Core.Exceptions;

namespace OAuthServer.Web.Controllers;

[ApiController]
[Route("api/connect")]
public class ConnectController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConnectController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("authorize")]
    public async Task<IActionResult> Authorize()
    {
        OpenIddictRequest? request = HttpContext.GetOpenIddictServerRequest();
        if (request == null)
            throw new BadRequestException("Invalid OpenID Connect request.");
        

        ClaimsPrincipal principal = await _mediator.Send(new AuthorizeCommand(request));
        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    [HttpPost("token")]
    public async Task<IActionResult> Exchange()
    {
        OpenIddictRequest request = HttpContext.GetOpenIddictServerRequest() ??
                                    throw new BadRequestException("Invalid OpenID Connect request.");

        ClaimsPrincipal principal = await _mediator.Send(new ExchangeTokenCommand(request));
        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    [Authorize(AuthenticationSchemes = OpenIddictServerAspNetCoreDefaults.AuthenticationScheme)]
    [HttpGet("userinfo"), HttpPost("userinfo")]
    public IActionResult GetUserInfo()
    {
        ClaimsPrincipal user = HttpContext.User;
        Dictionary<string, object> claims = new()
        {
            [OpenIddictConstants.Claims.Subject] = user.FindFirst(OpenIddictConstants.Claims.Subject)?.Value!,
            [OpenIddictConstants.Claims.Name] = user.FindFirst(OpenIddictConstants.Claims.Name)?.Value!,
            [OpenIddictConstants.Claims.Email] = user.FindFirst(OpenIddictConstants.Claims.Email)?.Value!
        };
        return Ok(claims);
    }
}