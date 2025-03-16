namespace OAuthServer.Application.DTOs.Auth;

public record SignUpDto
{
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; } 
}