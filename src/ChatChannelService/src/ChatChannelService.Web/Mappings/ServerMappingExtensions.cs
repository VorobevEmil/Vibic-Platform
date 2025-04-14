using ChatChannelService.Application.Features.Servers;
using ChatChannelService.Web.Models.Servers.Responses;

namespace ChatChannelService.Web.Mappings;

public static class ServerMappingExtensions
{
    public static ServerResponse MapToResponse(this ServerDto dto)
    {
        return new ServerResponse
        {
            Id = dto.Id,
            Name = dto.Name,
        };
    }
}