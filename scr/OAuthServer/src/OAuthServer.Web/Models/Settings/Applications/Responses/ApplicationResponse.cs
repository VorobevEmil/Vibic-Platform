namespace OAuthServer.Web.Models.Settings.Applications.Responses;

public class ApplicationResponse
{
    public string Id { get; init; } = string.Empty;
    public string ClientId { get; init; } = string.Empty;
    public string ClientSecret { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
}