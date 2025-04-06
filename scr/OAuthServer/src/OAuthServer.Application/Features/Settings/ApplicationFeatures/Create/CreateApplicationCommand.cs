using MediatR;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Create;

public sealed record CreateApplicationCommand(
    string DisplayName,
    List<string>? RedirectUris,
    List<string>? PostLogoutRedirectUris,
    List<string>? Permissions) : IRequest<ApplicationDTO>;