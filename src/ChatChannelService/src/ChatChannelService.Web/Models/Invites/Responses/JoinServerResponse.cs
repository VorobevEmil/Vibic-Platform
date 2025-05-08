namespace ChatChannelService.Web.Models.Invites.Responses;

public class JoinServerResponse
{
    public required Guid ServerId { get; init; }
    public required Guid ChannelId { get; init; }
}