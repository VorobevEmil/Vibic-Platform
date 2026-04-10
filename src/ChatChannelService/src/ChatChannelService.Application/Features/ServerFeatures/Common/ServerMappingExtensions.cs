using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Features.ServerFeatures.Common;

public static class ServerMappingExtensions
{
    public static ServerSummaryDto MapToServerSummaryDto(this Server server, Channel channel)
    {
        string? iconUrl = server.IconUrl;
        if (!string.IsNullOrWhiteSpace(iconUrl) && iconUrl.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            iconUrl = null;
        }

        return new ServerSummaryDto(
            server.Id, 
            iconUrl, 
            server.Name, 
            channel.Id);
    }

    public static ServerFullDto MapToServerFullDto(this Server server)
    {
        List<ServerChannelDto> serverChannels = server.Channels
            .ConvertAll(c => new ServerChannelDto(c.Id, c.Name!, c.ChannelType, c.IsPublic));
        List<ServerMemberDto> serverMembers = server.ServerMembers
            .OrderBy(sm => sm.DisplayName)
            .Select(sm => new ServerMemberDto(
                sm.ChatUserId,
                sm.ChatUser.DisplayName,
                sm.ChatUser.Username,
                sm.ChatUser.AvatarUrl))
            .ToList();

        string? iconUrl = server.IconUrl;
        if (!string.IsNullOrWhiteSpace(iconUrl) && iconUrl.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            iconUrl = null;
        }

        return new ServerFullDto(server.Id, server.Name, iconUrl, server.OwnerId, serverChannels, serverMembers);
    }
}
