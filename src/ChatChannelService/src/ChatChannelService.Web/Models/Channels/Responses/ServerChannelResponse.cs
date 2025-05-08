using ChatChannelService.Core.Enums;

namespace ChatChannelService.Web.Models.Channels.Responses;


public class ServerChannelResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required ChannelType ChannelType { get; init; }
    public required bool IsPublic { get; init; }
}