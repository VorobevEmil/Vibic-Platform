using MediatR;

namespace UserService.Application.Features.UserProfileFeatures.Commands.Update;

public record UpdateUserProfileCommand(string Username, string? AvatarUrl, string? Bio) : IRequest;