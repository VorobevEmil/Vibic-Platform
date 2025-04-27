namespace ChatChannelService.Web.Models.Channels.Responses;

public class ChannelMemberResponse
{
    public required Guid UserId { get; init; }
    public required string DisplayName { get; init; }
    public required string? AvatarUrl { get; init; }
}