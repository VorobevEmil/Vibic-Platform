using ChatChannelService.Web.Models.Channels.Responses;

namespace ChatChannelService.Web.Models.Servers.Responses;

public class ServerFullResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? IconUrl { get; init; }
    public required Guid OwnerId { get; init; }
    public required List<ServerChannelResponse> Channels { get; init; }
    public required List<ServerMemberResponse> Members { get; init; }
}
