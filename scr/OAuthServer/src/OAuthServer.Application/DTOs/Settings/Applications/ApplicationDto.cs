namespace OAuthServer.Application.DTOs.Settings.Applications;

public record ApplicationDto
{
    public required string DisplayName { get; init; }
    public List<string> RedirectUris { get; set; } = new();
    public List<string> PostLogoutRedirectUris { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}