namespace ChatChannelService.Web.Models.Channels.Responses;

public class ServerChannelParticipantResponse
{
    public required Guid UserId { get; init; }
    public required string DisplayName { get; init; }
    public required string Username { get; init; }
    public string? AvatarUrl { get; init; }
}
