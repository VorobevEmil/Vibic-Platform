using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OAuthServer.Application.Features.AuthFeatures.SignIn;
using OAuthServer.Application.Features.AuthFeatures.SignUp;
using OAuthServer.Web.Models.Auth;

namespace OAuthServer.Web.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Войти в систему
    /// </summary>
    /// <param name="command">Модель запроса</param>
    /// <response code="200">Пользователь вошел</response>
    /// <response code="404">Пользователь не найден</response>
    /// <response code="401">Не верные учетные данные</response>
    [HttpPost("sign-in")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SignIn(SignInRequest request)
    {
        SignInCommand command = new SignInCommand(request.Email, request.Password);

        await _mediator.Send(command);

        return Ok();
    }

    [HttpPost("sign-up")]
    public async Task<IActionResult> SignUp(SignUpRequest request)
    {
        SignUpCommand command = new(request.Username, request.Email, request.Password);

        await _mediator.Send(command);

        return Created();
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }
}