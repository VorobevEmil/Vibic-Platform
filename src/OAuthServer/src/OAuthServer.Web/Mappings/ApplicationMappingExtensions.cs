using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Create;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Update;
using OAuthServer.Web.Models.Settings.Applications.Requests;
using OAuthServer.Web.Models.Settings.Applications.Responses;

namespace OAuthServer.Web.Mappings;

public static class ApplicationMappingExtensions
{
    public static CreateApplicationCommand MapToCreateCommand(this ApplicationRequest request)
    {
        return new(
            request.DisplayName,
            request.RedirectUris,
            request.PostLogoutRedirectUris,
            request.Permissions);
    }

    public static UpdateApplicationCommand MapToUpdateCommand(this ApplicationRequest request, string id)
    {
        return new(
            id,
            request.DisplayName,
            request.RedirectUris,
            request.PostLogoutRedirectUris,
            request.Permissions);
    }

    public static ApplicationResponse MapToResponse(this ApplicationDTO dto)
    {
        return new()
        {
            Id = dto.Id,
            ClientId = dto.ClientId,
            ClientSecret = dto.ClientSecret,
            DisplayName = dto.DisplayName,
        };
    }
}