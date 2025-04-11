using MediatR;
using UserService.Application.Features.UserProfileFeatures.Common;

namespace UserService.Application.Features.UserProfileFeatures.Queries.Get;

public record GetUserProfileQuery(Guid Id) : IRequest<UserProfileDto>;