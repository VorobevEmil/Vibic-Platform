namespace OAuthServer.Application.DTOs.UserAuthenticationService;

public record SignUpDto
{
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; } 
}