using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OAuthServer.Application.Features.AuthFeatures.Commands;
using OAuthServer.Web.Models.Auth;

namespace OAuthServer.Web.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Войти в систему
    /// </summary>
    /// <param name="request">Модель запроса</param>
    /// <response code="200">Пользователь вошел</response>
    /// <response code="404">Пользователь не найден</response>
    /// <response code="401">Не верные учетные данные</response>
    [HttpPost("sign-in")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SignIn(SignInRequest request)
    {
        SignInCommand command = new(request.Email, request.Password);

        string accessToken = await mediator.Send(command);

        return Ok(new TokenResponse(accessToken));
    }

    [HttpPost("sign-up")]
    public async Task<IActionResult> SignUp(SignUpRequest request)
    {
        SignUpCommand command = new(request.DisplayName, request.Username, request.Email, request.Password);

        await mediator.Send(command);

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