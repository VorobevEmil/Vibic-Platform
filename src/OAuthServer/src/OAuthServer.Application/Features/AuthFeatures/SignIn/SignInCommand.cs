using MediatR;

namespace OAuthServer.Application.Features.AuthFeatures.SignIn;

public record SignInCommand(string Email, string Password) : IRequest;