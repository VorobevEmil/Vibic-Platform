using MediatR;

namespace UserService.Application.Features.UserProfileFeatures.Commands.Create;

public sealed record CreateUserProfileCommand(Guid UserId, string Username, string Email) : IRequest;