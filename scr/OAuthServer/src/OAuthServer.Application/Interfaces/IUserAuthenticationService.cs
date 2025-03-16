using OAuthServer.Application.DTOs.Auth;

namespace OAuthServer.Application.Interfaces;

public interface IUserAuthenticationService
{
    Task SignUpAsync(SignUpDto signUpDto);
    Task SignInAsync(SignInDto signInDto);
}