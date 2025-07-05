using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using OAuthServer.Application.Repositories;
using OAuthServer.Core.Entities;
using Vibic.Shared.Core.Exceptions;

namespace OAuthServer.Application.Features.AuthFeatures.Commands;

public record SignInCommand(string Email, string Password) : IRequest<string>;

public class SignInHandler : IRequestHandler<SignInCommand, string>
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public SignInHandler(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<string> Handle(SignInCommand command, CancellationToken cancellationToken)
    {
        User? user = await _userRepository.GetByEmailAsync(command.Email, cancellationToken);

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

        string keyString = _configuration["Authentication:Jwt:Key"] ?? string.Empty;
        SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(keyString));
        SigningCredentials signingCredentials = new(key, SecurityAlgorithms.HmacSha256);

        List<Claim> claims =
        [
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email)
        ];

        string issuer = _configuration["Authentication:Jwt:Issuer"];
        string audience = _configuration["Authentication:Jwt:Audience"];

        JwtSecurityToken jwt = new(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: signingCredentials);


        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}