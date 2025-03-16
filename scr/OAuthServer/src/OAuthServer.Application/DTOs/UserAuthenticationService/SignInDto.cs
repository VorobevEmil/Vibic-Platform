using System.ComponentModel.DataAnnotations;

namespace OAuthServer.Application.DTOs.UserAuthenticationService;

public record SignInDto
{
    public required string Email { get; init; } 
    [MinLength(6)]
    public required string Password { get; init; } 
}