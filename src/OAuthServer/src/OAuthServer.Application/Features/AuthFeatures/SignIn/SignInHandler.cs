using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.Repositories;
using OAuthServer.Core.Entities;
using Vibic.Shared.Core.Exceptions;

namespace OAuthServer.Application.Features.AuthFeatures.SignIn;

public class SignInHandler : IRequestHandler<SignInCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public SignInHandler(IUserRepository userRepository, IHttpContextAccessor httpContextAccessor)
    {
        _userRepository = userRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task Handle(SignInCommand command, CancellationToken cancellationToken)
    {
        User? user = await _userRepository.GetByEmailAsync(command.Email);

        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        if (!BCrypt.Net.BCrypt.Verify(command.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (user.IsLockedOut && user.LockoutEnd > DateTime.UtcNow)
        {
            throw new UnauthorizedException("Account is locked");
        }

        List<Claim> claims =
        [
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email)
        ];

        ClaimsIdentity identity = new(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        ClaimsPrincipal principal = new(identity);
        await _httpContextAccessor.HttpContext!.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal);
    }
}