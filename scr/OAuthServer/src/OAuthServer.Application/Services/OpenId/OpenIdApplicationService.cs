using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using OAuthServer.Application.DTOs.Settings.Applications;
using OAuthServer.Application.Exceptions;
using OAuthServer.Application.Helpers;
using OAuthServer.Application.Interfaces.OpenId;
using OAuthServer.Core.Entities;
using OAuthServer.Core.Interfaces;
using OpenIddict.Abstractions;
using OpenIddict.EntityFrameworkCore.Models;

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

    public async Task<string> CreateAsync(ApplicationDto dto)
    {
        string clientId = SecurityHelper.GenerateClientId();

        if (await _applicationManager.FindByClientIdAsync(clientId) is not null)
        {
            throw new ValidationException($"Client with ID '{clientId}' already exists.");
        }

        OpenIddictApplicationDescriptor descriptor = new()
        {
            ClientId = clientId,
            ClientSecret = SecurityHelper.GenerateSecureClientSecret(),
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

        OpenIddictEntityFrameworkCoreApplication? application =
            await _applicationManager.CreateAsync(descriptor) as OpenIddictEntityFrameworkCoreApplication;

        string userId = _httpContextAccessor.HttpContext!.User.Claims
            .First(x => x.Type == ClaimTypes.NameIdentifier)
            .Value;

        User? user = await _userRepository.GetByIdAsync(userId);

        UserProvider userProvider = new(user!, application!);
        
        await _userProviderRepository.CreateAsync(userProvider);

        return clientId;
    }

    //TODO: Implement method
    public Task UpdateAsync(ApplicationDto dto)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(string id)
    {
        throw new NotImplementedException();
    }
}