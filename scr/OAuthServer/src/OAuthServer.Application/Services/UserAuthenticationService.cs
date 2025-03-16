using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using OAuthServer.Application.DTOs.Auth;
using OAuthServer.Application.Exceptions;
using OAuthServer.Application.Interfaces;
using OAuthServer.Core.Entities;
using OAuthServer.Core.Interfaces;

namespace OAuthServer.Application.Services;

public class UserAuthenticationService : IUserAuthenticationService
{
    private readonly IUserRepository _userRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserAuthenticationService(IUserRepository userRepository, IHttpContextAccessor httpContextAccessor)
    {
        _userRepository = userRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task SignUpAsync(SignUpDto signUpDto)
    {
        User? existingUser = await _userRepository.GetByEmailAsync(signUpDto.Email);
        if (existingUser != null)
        {
            throw new ValidationException("User with this email already exists.");
        }

        if (signUpDto.Password.Length < 6)
            throw new ValidationException("Password must be at least 6 characters.");


        string passwordHash = BCrypt.Net.BCrypt.HashPassword(signUpDto.Password);

        User user = new(signUpDto.Username, signUpDto.Email, passwordHash);
        await _userRepository.AddAsync(user);
    }

    public async Task SignInAsync(SignInDto signInDto)
    {
        User? user = await _userRepository.GetByEmailAsync(signInDto.Email);

        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        if (!BCrypt.Net.BCrypt.Verify(signInDto.Password, user.PasswordHash))
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