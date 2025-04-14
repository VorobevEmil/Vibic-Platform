using MediatR;
using OpenIddict.Abstractions;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.Core.Exceptions;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Commands;

public sealed record UpdateApplicationCommand(
    string Id,
    string DisplayName,
    List<string>? RedirectUris,
    List<string>? PostLogoutRedirectUris,
    List<string>? Permissions) : IRequest;

public class UpdateApplicationHandler : IRequestHandler<UpdateApplicationCommand>
{
    private readonly IOpenIddictApplicationManager _openIddictApplicationManager;

    public UpdateApplicationHandler(IOpenIddictApplicationManager openIddictApplicationManager)
    {
        _openIddictApplicationManager = openIddictApplicationManager;
    }

    public async Task Handle(UpdateApplicationCommand command, CancellationToken cancellationToken)
    {
        OpenIddictEntityFrameworkCoreApplication app =
            await _openIddictApplicationManager.FindByIdAsync(command.Id, cancellationToken) as
                OpenIddictEntityFrameworkCoreApplication
            ?? throw new NotFoundException("Application not found");

        OpenIddictApplicationDescriptor descriptor = new()
        {
            ApplicationType = OpenIddictConstants.ClientTypes.Public,
            ClientId = app.ClientId,
            ClientSecret = app.ClientSecret,
            DisplayName = command.DisplayName
        };

        foreach (Uri item in command.RedirectUris?.Select(uri => new Uri(uri)) ?? [])
        {
            descriptor.RedirectUris.Add(item);
        }

        foreach (Uri item in command.PostLogoutRedirectUris?.Select(uri => new Uri(uri)) ?? [])
        {
            descriptor.PostLogoutRedirectUris.Add(item);
        }

        foreach (string item in command?.Permissions ?? [])
        {
            descriptor.Permissions.Add(item);
        }


        await _openIddictApplicationManager.UpdateAsync(app, descriptor, cancellationToken);
    }
}