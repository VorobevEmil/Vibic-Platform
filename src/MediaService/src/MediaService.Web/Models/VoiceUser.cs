namespace MediaService.Web.Models;

public class VoiceUser
{
    public required string UserId { get; init; }
    public required string DisplayName { get; init; }
    public string? AvatarUrl { get; init; }
    public bool IsMicOn { get; set; } = true;
}
