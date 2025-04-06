using MediatR;

namespace OAuthServer.Application.Features.AuthFeatures.SignUp;

public record SignUpCommand(string Username, string Email, string Password) : IRequest;