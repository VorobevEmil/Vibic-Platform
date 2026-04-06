namespace ChatChannelService.Web.Models.Servers.Responses;

public class ServerMemberResponse
{
    public required Guid UserId { get; init; }
    public required string DisplayName { get; init; }
    public required string Username { get; init; }
    public string? AvatarUrl { get; init; }
}
