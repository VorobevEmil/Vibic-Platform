using System.ComponentModel.DataAnnotations;

namespace OAuthServer.Web.Models.Settings.Applications.Requests;

public class ApplicationRequest
{
    [Required]
    public required string DisplayName { get; init; }
    public List<string>? RedirectUris { get; init; }
    public List<string>? PostLogoutRedirectUris { get; init; }
    public List<string>? Permissions { get; init; }
}