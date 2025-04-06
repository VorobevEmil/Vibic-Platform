using MediatR;

namespace UserService.Application.Features.UserProfileFeatures.Update;

public record UpdateUserProfileCommand(string Username, string? AvatarUrl, string? Bio) : IRequest;