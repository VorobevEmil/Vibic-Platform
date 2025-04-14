using MediatR;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.Repositories;
using OpenIddict.Abstractions;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Commands;

public record DeleteApplicationCommand(string Id) : IRequest;

public class DeleteApplicationHandler : IRequestHandler<DeleteApplicationCommand>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IOpenIddictApplicationRepository _openIddictApplicationRepository;
    private readonly IOpenIddictApplicationManager _openIddictApplicationManager;

    public DeleteApplicationHandler(
        IHttpContextAccessor httpContextAccessor,
        IOpenIddictApplicationRepository openIddictApplicationRepository,
        IOpenIddictApplicationManager openIddictApplicationManager)
    {
        _httpContextAccessor = httpContextAccessor;
        _openIddictApplicationRepository = openIddictApplicationRepository;
        _openIddictApplicationManager = openIddictApplicationManager;
    }

    public async Task Handle(DeleteApplicationCommand command, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        OpenIddictEntityFrameworkCoreApplication application =
            await _openIddictApplicationRepository.GetApplicationByIdAndUserIdAsync(command.Id, userId, cancellationToken)
            ?? throw new NotFoundException("Application not found");

        await _openIddictApplicationManager.DeleteAsync(application, cancellationToken);
    }
}