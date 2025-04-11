namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;

public record ApplicationDTO
{
    public string Id { get; init; } = string.Empty;
    public string ClientId { get; init; } = string.Empty;
    public string ClientSecret { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
}