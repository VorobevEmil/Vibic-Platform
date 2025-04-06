using MediatR;
using UserService.Application.Features.UserProfileFeatures.Common;

namespace UserService.Application.Features.UserProfileFeatures.GetMyProfile;

public record GetMyProfileQuery : IRequest<UserProfileDTO>;