namespace ChatChannelService.Web.Models.Channels.Responses;

public class ChannelDirectChannelResponse
{
    public required Guid Id { get; init; }
    public required List<ChannelMemberResponse> ChannelMembers { get; init; }
}