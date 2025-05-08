using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Features.ServerFeatures.Common;

public static class ServerMappingExtensions
{
    public static ServerSummaryDto MapToServerSummaryDto(this Server server, Channel channel)
    {
        return new ServerSummaryDto(
            server.Id, 
            server.IconUrl, 
            server.Name, 
            channel.Id);
    }

    public static ServerFullDto MapToServerFullDto(this Server server)
    {
        List<ServerChannelDto> serverChannels = server.Channels
            .ConvertAll(c => new ServerChannelDto(c.Id, c.Name!, c.ChannelType, c.IsPublic));


        return new ServerFullDto(server.Id, server.Name, serverChannels);
    }
}