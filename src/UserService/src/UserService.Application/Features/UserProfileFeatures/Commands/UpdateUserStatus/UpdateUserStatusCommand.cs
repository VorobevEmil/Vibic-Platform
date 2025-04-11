using MediatR;
using UserService.Core.Enums;

namespace UserService.Application.Features.UserProfileFeatures.UpdateUserStatus;

public record UpdateUserStatusCommand(UserStatus UserStatus) : IRequest;