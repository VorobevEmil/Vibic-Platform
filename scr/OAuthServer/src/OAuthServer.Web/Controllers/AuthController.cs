using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OAuthServer.Application.DTOs.Auth;
using OAuthServer.Application.Interfaces;

namespace OAuthServer.Web.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserAuthenticationService _userAuthenticationService;

    public AuthController(IUserAuthenticationService userAuthenticationService)
    {
        _userAuthenticationService = userAuthenticationService;
    }

    /// <summary>
    /// Войти в систему
    /// </summary>
    /// <param name="request">Модель запроса</param>
    /// <response code="200">Пользователь вошел</response>
    /// <response code="404">Пользователь не найден</response>
    /// <response code="401">Не верные учетные данные</response>
    [HttpPost("sign-in")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SignIn(SignInDto request)
    {
        await _userAuthenticationService.SignInAsync(request);

        return Ok();
    }

    [HttpPost("sign-up")]
    public async Task<IActionResult> SignUp(SignUpDto request)
    {
        await _userAuthenticationService.SignUpAsync(request);

        return Created();
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    [HttpGet("check")]
    [Authorize]
    public IActionResult Check()
    {
        return Ok();
    }
}