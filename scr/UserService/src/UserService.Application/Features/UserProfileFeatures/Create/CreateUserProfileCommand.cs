using MediatR;

namespace UserService.Application.Features.UserProfileFeatures.Create;

public sealed record CreateUserProfileCommand(Guid UserId, string Username, string Email) : IRequest;