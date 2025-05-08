using ChatChannelService.Web.Models.Channels.Responses;

namespace ChatChannelService.Web.Models.Servers.Responses;

public class ServerFullResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required List<ServerChannelResponse> Channels { get; init; }
}