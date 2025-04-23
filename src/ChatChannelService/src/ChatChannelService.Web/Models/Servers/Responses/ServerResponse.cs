namespace ChatChannelService.Web.Models.Servers.Responses;

public class ServerResponse
{
    public required Guid Id { get; init; }
    public string? IconUrl { get; init; }
    public required string Name { get; init; }
    public required Guid ChannelId { get; init; }
}