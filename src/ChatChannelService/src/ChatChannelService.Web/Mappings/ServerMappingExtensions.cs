using ChatChannelService.Application.Features.ServerFeatures;
using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Web.Models.Servers.Responses;

namespace ChatChannelService.Web.Mappings;

public static class ServerMappingExtensions
{
    public static ServerMemberResponse MapToResponse(this ServerMemberDto dto)
    {
        return new ServerMemberResponse
        {
            UserId = dto.UserId,
            DisplayName = dto.DisplayName,
            Username = dto.Username,
            AvatarUrl = dto.AvatarUrl
        };
    }

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
            IconUrl = dto.IconUrl,
            Channels = dto.Channels
                .ConvertAll(sc => sc.MapToServerChannelResponse()),
            Members = dto.Members
                .ConvertAll(member => member.MapToResponse())
        };
    }
}
