namespace ChatChannelService.Web.Models.Servers.Responses;

public class ServerFullResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required List<ServerChannelResponse> Channels { get; init; }
}

public class ServerChannelResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required bool IsPrivate { get; init; }
}