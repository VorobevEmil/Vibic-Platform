using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using OAuthServer.Application.Repositories;
using OAuthServer.Core.Entities;
using Vibic.Shared.Core.Exceptions;

namespace OAuthServer.Application.Features.AuthFeatures.Commands;

public record SignInCommand(string Email, string Password) : IRequest<string>;

public class SignInHandler : IRequestHandler<SignInCommand, string>
{
    private readonly IUserRepository _userRepository;

    public SignInHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
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

        SymmetricSecurityKey key = new("super_secret_dummy_key_1234567890"u8.ToArray());
        SigningCredentials signingCredentials = new(key, SecurityAlgorithms.HmacSha256);

        List<Claim> claims =
        [
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email)
        ];

        JwtSecurityToken jwt = new(claims: claims, signingCredentials: signingCredentials);


        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}