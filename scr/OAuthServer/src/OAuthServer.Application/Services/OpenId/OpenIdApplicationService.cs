using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.DTOs.Settings.Applications;
using OAuthServer.Application.Extensions;
using OAuthServer.Application.Helpers;
using OAuthServer.Application.Helpers.Mappings;
using OAuthServer.Application.Interfaces.OpenId;
using OAuthServer.Core.Entities;
using OAuthServer.Core.Interfaces;
using OpenIddict.Abstractions;
using OpenIddict.EntityFrameworkCore.Models;
using Vibic.Shared.Core.Exceptions;

namespace OAuthServer.Application.Services.OpenId;

public class OpenIdApplicationService : IOpenIdApplicationService
{
    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserRepository _userRepository;
    private readonly IUserProviderRepository _userProviderRepository;
    private readonly IOpenIddictApplicationRepository _applicationRepository;

    public OpenIdApplicationService(
        IOpenIddictApplicationManager applicationManager,
        IHttpContextAccessor httpContextAccessor,
        IUserRepository userRepository,
        IUserProviderRepository userProviderRepository,
        IOpenIddictApplicationRepository applicationRepository)
    {
        _applicationManager = applicationManager;
        _httpContextAccessor = httpContextAccessor;
        _userRepository = userRepository;
        _userProviderRepository = userProviderRepository;
        _applicationRepository = applicationRepository;
    }

    public async Task<List<ApplicationResponse>> GetAllAsync()
    {
        string userId = _httpContextAccessor.HttpContext!.User.Claims
            .First(x => x.Type == ClaimTypes.NameIdentifier).Value;

        List<OpenIddictEntityFrameworkCoreApplication> applications =
            await _applicationRepository.GetApplicationsByUserIdAsync(Guid.Parse(userId));

        return applications.ConvertAll(x => x.MapToResponse());
    }

    public async Task<ApplicationResponse> GetByIdAsync(string id)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        OpenIddictEntityFrameworkCoreApplication application =
            await _applicationRepository.GetApplicationByIdAndUserIdAsync(id, userId)
            ?? throw new NotFoundException("Application not found");

        return application.MapToResponse();
    }

    public async Task<ApplicationResponse> CreateAsync(ApplicationDto dto)
    {
        string clientId = SecurityHelper.GenerateClientId();
        string clientSecret = SecurityHelper.GenerateSecureClientSecret();

        if (await _applicationManager.FindByClientIdAsync(clientId) is not null)
        {
            throw new ValidationException($"Client with ID '{clientId}' already exists.");
        }

        OpenIddictApplicationDescriptor descriptor = new()
        {
            ApplicationType = OpenIddictConstants.ClientTypes.Public,
            ClientId = clientId,
            ClientSecret = clientSecret,
            DisplayName = dto.DisplayName
        };

        foreach (Uri item in dto.RedirectUris.Select(uri => new Uri(uri)))
        {
            descriptor.RedirectUris.Add(item);
        }

        foreach (Uri item in dto.PostLogoutRedirectUris.Select(uri => new Uri(uri)))
        {
            descriptor.PostLogoutRedirectUris.Add(item);
        }

        foreach (string item in dto.Permissions)
        {
            descriptor.Permissions.Add(item);
        }

        OpenIddictEntityFrameworkCoreApplication application = (OpenIddictEntityFrameworkCoreApplication)
            await _applicationManager.CreateAsync(descriptor);

        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        User user = await _userRepository.GetByIdAsync(userId) ?? throw new NotFoundException("User not found");
        await _userProviderRepository.CreateAsync(new UserProvider(user, application));

        return application.MapToResponse(false);
    }

    public async Task UpdateAsync(string id, ApplicationDto dto)
    {
        OpenIddictEntityFrameworkCoreApplication app =
            await _applicationManager.FindByIdAsync(id) as OpenIddictEntityFrameworkCoreApplication
            ?? throw new NotFoundException("Application not found");

        OpenIddictApplicationDescriptor descriptor = new()
        {
            ApplicationType = OpenIddictConstants.ClientTypes.Public,
            ClientId = app.ClientId,
            ClientSecret = app.ClientSecret,
            DisplayName = dto.DisplayName
        };
        
        foreach (Uri item in dto.RedirectUris.Select(uri => new Uri(uri)))
        {
            descriptor.RedirectUris.Add(item);
        }

        foreach (Uri item in dto.PostLogoutRedirectUris.Select(uri => new Uri(uri)))
        {
            descriptor.PostLogoutRedirectUris.Add(item);
        }

        foreach (string item in dto.Permissions)
        {
            descriptor.Permissions.Add(item);
        }


        await _applicationManager.UpdateAsync(app, descriptor);
    }

    public async Task DeleteAsync(string id)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        OpenIddictEntityFrameworkCoreApplication application =
            await _applicationRepository.GetApplicationByIdAndUserIdAsync(id, userId)
            ?? throw new NotFoundException("Application not found");

        await _applicationManager.DeleteAsync(application);
    }
}