using OpenIddict.EntityFrameworkCore.Models;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;

public static class ApplicationDtoMapper
{
    public static ApplicationDto MapToDTO(
        this OpenIddictEntityFrameworkCoreApplication application,
        bool hideClientSecret = true)
    {
        string clientSecret = application.ClientSecret!;
        if (hideClientSecret)
        {
            clientSecret = new string('*', 15) + clientSecret.Substring(clientSecret.Length - 3, 3);
        }

        return new ApplicationDto
        {
            Id = application.Id!,
            ClientId = application.ClientId!,
            ClientSecret = clientSecret,
            DisplayName = application.DisplayName!
        };
    }
}