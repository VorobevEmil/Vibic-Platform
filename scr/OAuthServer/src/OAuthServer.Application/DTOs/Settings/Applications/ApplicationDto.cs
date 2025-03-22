namespace OAuthServer.Application.DTOs.Settings.Applications;

public record ApplicationDto
{
    public string? Id { get; set; }
    public required string DisplayName { get; init; }
    public List<string> RedirectUris { get; init; } = new();
    public List<string> PostLogoutRedirectUris { get; init; } = new();
    public List<string> Permissions { get; init; } = new();
}