using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.DTOs.Settings.Applications;
using OAuthServer.Application.Helpers;
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

    public OpenIdApplicationService(
        IOpenIddictApplicationManager applicationManager,
        IHttpContextAccessor httpContextAccessor,
        IUserRepository userRepository,
        IUserProviderRepository userProviderRepository)
    {
        _applicationManager = applicationManager;
        _httpContextAccessor = httpContextAccessor;
        _userRepository = userRepository;
        _userProviderRepository = userProviderRepository;
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
            (await _applicationManager.CreateAsync(descriptor));

        string userId = _httpContextAccessor.HttpContext!.User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        User user = await _userRepository.GetByIdAsync(userId) ?? throw new NotFoundException("User not found");
        await _userProviderRepository.CreateAsync(new UserProvider(user, application));

        return new ApplicationResponse
        {
            Id = application.Id!,
            ClientId = application.ClientId!,
            ClientSecret = application.ClientSecret!,
            DisplayName = application.DisplayName!
        };
    }

    public async Task<List<ApplicationResponse>> GetAllAsync()
    {
        List<ApplicationResponse> result = [];

        await foreach (object app in _applicationManager.ListAsync())
        {
            if (app is OpenIddictEntityFrameworkCoreApplication application)
            {
                string appSecret = application.ClientSecret!;
                result.Add(new ApplicationResponse
                {
                    Id = application.Id!,
                    ClientId = application.ClientId!,
                    ClientSecret = new string('*', appSecret.Length / 2) + appSecret.Substring(appSecret.Length - 5, 5),
                    DisplayName = application.DisplayName!
                });
            }
        }

        return result;
    }

    public async Task<ApplicationResponse> GetByIdAsync(string id)
    {
        OpenIddictEntityFrameworkCoreApplication application =
            await _applicationManager.FindByIdAsync(id) as OpenIddictEntityFrameworkCoreApplication
            ?? throw new NotFoundException("Application not found");

        string appSecret = application.ClientSecret!;
        return new ApplicationResponse
        {
            Id = application.Id!,
            ClientId = application.ClientId!,
            ClientSecret = new string('*', appSecret.Length / 2) + appSecret.Substring(appSecret.Length - 5, 5),
            DisplayName = application.DisplayName!
        };
    }

    public async Task UpdateAsync(string id, ApplicationDto dto)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ValidationException("Application ID is required");

        OpenIddictEntityFrameworkCoreApplication app =
            await _applicationManager.FindByIdAsync(id) as OpenIddictEntityFrameworkCoreApplication
            ?? throw new NotFoundException("Application not found");

        OpenIddictApplicationDescriptor descriptor = new()
        {
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
        OpenIddictEntityFrameworkCoreApplication app =
            await _applicationManager.FindByIdAsync(id) as OpenIddictEntityFrameworkCoreApplication
            ?? throw new NotFoundException("Application not found");

        await _applicationManager.DeleteAsync(app);
    }
}