using ChatChannelService.Core.Enums;

namespace ChatChannelService.Web.Models.Channels.Requests;

public class CreateServerChannelRequest
{
    public required string Name { get; init; }
    public required ChannelType ChannelType { get; init; }
    public required bool IsPublic { get; init; }
}