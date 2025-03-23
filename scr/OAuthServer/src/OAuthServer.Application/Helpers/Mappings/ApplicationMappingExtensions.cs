using OAuthServer.Application.DTOs.Settings.Applications;
using OpenIddict.EntityFrameworkCore.Models;

namespace OAuthServer.Application.Helpers.Mappings;

public static class ApplicationMappingExtensions
{
    public static ApplicationResponse MapToResponse(
        this OpenIddictEntityFrameworkCoreApplication application,
        bool hideClientSecret = true)
    {
        string clientSecret = application.ClientSecret!;
        if (hideClientSecret)
        {
            clientSecret = new string('*', 15) + clientSecret.Substring(clientSecret.Length - 3, 3);
        }

        return new ApplicationResponse
        {
            Id = application.Id!,
            ClientId = application.ClientId!,
            ClientSecret = clientSecret,
            DisplayName = application.DisplayName!
        };
    }
}