using OAuthServer.Application.DTOs.UserAuthenticationService;

namespace OAuthServer.Application.Interfaces;

public interface IUserAuthenticationService
{
    Task SignUpAsync(SignUpDto signUpDto);
    Task SignInAsync(SignInDto signInDto);
}