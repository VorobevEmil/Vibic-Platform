using MediatR;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.GetAll;

public sealed record GetAllApplicationQuery : IRequest<List<ApplicationDTO>>;