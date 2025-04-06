using MediatR;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Get;

public sealed record GetApplicationQuery(string Id) : IRequest<ApplicationDTO>;