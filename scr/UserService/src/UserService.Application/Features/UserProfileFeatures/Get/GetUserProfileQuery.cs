using MediatR;
using UserService.Application.Features.UserProfileFeatures.Common;

namespace UserService.Application.Features.UserProfileFeatures.Get;

public record GetUserProfileQuery(Guid Id) : IRequest<UserProfileDTO>;