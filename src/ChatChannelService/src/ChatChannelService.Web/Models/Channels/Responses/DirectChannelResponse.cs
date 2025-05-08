namespace ChatChannelService.Web.Models.Channels.Responses;

public class DirectChannelResponse
{
    public required Guid Id { get; init; }
    public required List<ChannelMemberResponse> ChannelMembers { get; init; }
}