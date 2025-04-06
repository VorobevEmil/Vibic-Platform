using MediatR;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Update;

public sealed record UpdateApplicationCommand(
    string Id,
    string DisplayName,
    List<string>? RedirectUris,
    List<string>? PostLogoutRedirectUris,
    List<string>? Permissions) : IRequest;