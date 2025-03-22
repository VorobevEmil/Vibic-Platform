namespace OAuthServer.Application.DTOs.Settings.Applications;

public record ApplicationResponse
{
    public string Id { get; init; } = string.Empty;
    public string ClientId { get; init; } = string.Empty;
    public string ClientSecret { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
}