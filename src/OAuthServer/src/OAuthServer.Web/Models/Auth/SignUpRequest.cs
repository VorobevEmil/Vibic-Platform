using System.ComponentModel.DataAnnotations;

namespace OAuthServer.Web.Models.Auth;

public class SignUpRequest
{
    public required string Username { get; init; }
    [EmailAddress]
    public required string Email { get; init; }
    [MinLength(8)]
    public required string Password { get; init; }
}