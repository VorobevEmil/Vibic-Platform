using MediatR;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;
using OAuthServer.Application.Helpers;
using OAuthServer.Application.Repositories;
using OAuthServer.Core.Entities;
using OpenIddict.Abstractions;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Commands;

public sealed record CreateApplicationCommand(
    string DisplayName,
    List<string>? RedirectUris,
    List<string>? PostLogoutRedirectUris,
    List<string>? Permissions) : IRequest<ApplicationDto>;

public class CreateApplicationHandler : IRequestHandler<CreateApplicationCommand, ApplicationDto>
{
    private readonly IOpenIddictApplicationManager _openIddictApplicationManager;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserRepository _userRepository;
    private readonly IUserProviderRepository _userProviderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateApplicationHandler(
        IOpenIddictApplicationManager openIddictApplicationManager,
        IHttpContextAccessor httpContextAccessor,
        IUserRepository userRepository,
        IUserProviderRepository userProviderRepository,
        IUnitOfWork unitOfWork)
    {
        _openIddictApplicationManager = openIddictApplicationManager;
        _httpContextAccessor = httpContextAccessor;
        _userRepository = userRepository;
        _userProviderRepository = userProviderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApplicationDto> Handle(CreateApplicationCommand command, CancellationToken cancellationToken)
    {
        string clientId = SecurityHelper.GenerateClientId();
        string clientSecret = SecurityHelper.GenerateSecureClientSecret();

        if (await _openIddictApplicationManager.FindByClientIdAsync(clientId, cancellationToken) is not null)
        {
            throw new BadRequestException($"Client with ID '{clientId}' already exists.");
        }

        OpenIddictApplicationDescriptor descriptor = new()
        {
            ApplicationType = OpenIddictConstants.ClientTypes.Public,
            ClientId = clientId,
            ClientSecret = clientSecret,
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

        foreach (string item in command.Permissions ?? [])
        {
            descriptor.Permissions.Add(item);
        }

        OpenIddictEntityFrameworkCoreApplication application = (OpenIddictEntityFrameworkCoreApplication)
            await _openIddictApplicationManager.CreateAsync(descriptor, cancellationToken);

        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        User user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        await _userProviderRepository.CreateAsync(new UserProvider(user, application));
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return application.MapToDTO(false);
    }
}