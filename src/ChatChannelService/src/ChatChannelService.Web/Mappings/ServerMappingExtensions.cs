using ChatChannelService.Application.Features.ServerFeatures;
using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Web.Models.Servers.Responses;

namespace ChatChannelService.Web.Mappings;

public static class ServerMappingExtensions
{
    public static ServerSummaryResponse MapToResponse(this ServerSummaryDto dto)
    {
        return new ServerSummaryResponse
        {
            Id = dto.Id,
            IconUrl = dto.IconUrl,
            Name = dto.Name,
            ChannelId = dto.ChannelId
        };
    }

    public static ServerFullResponse MapToResponse(this ServerFullDto dto)
    {
        return new ServerFullResponse
        {
            Id = dto.Id,
            Name = dto.Name,
            Channels = dto.Channels
                .ConvertAll(sc => new ServerChannelResponse
                {
                    Id = sc.Id,
                    Name = sc.Name,
                    IsPrivate = sc.IsPrivate
                })
        };
    }
}