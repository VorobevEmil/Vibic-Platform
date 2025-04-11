using System.ComponentModel.DataAnnotations;

namespace OAuthServer.Web.Models.Auth;

public sealed class SignInRequest
{
    [EmailAddress]
    public required string Email { get; set; } 
    public required string Password { get; set; }
}