namespace ChatChannelService.Web.Models.Channels.Requests;

public class UpdateServerChannelRequest
{
    public required string Name { get; init; }
    public required bool IsPublic { get; init; }
    public List<Guid>? MemberIds { get; init; }
}
