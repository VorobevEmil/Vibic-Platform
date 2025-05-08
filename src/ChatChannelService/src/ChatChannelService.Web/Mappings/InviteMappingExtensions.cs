using ChatChannelService.Application.Features.InviteFeatures.Commands;
using ChatChannelService.Application.Features.InviteFeatures.Common;
using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Web.Models.Invites.Responses;
using ChatChannelService.Web.Models.Servers.Responses;

namespace ChatChannelService.Web.Mappings;

public static class InviteMappingExtensions
{
    public static InviteResponse MapToResponse(this InviteDto dto)
    {
        return new InviteResponse
        {
            Code = dto.Code
        };
    }

    public static InviteInfoSummaryResponse MapToResponse(this InviteInfoSummaryDto dto)
    {
        return new InviteInfoSummaryResponse
        {
            ServerName = dto.ServerName,
            IconUrl = dto.IconUrl
        };
    }

    public static JoinServerResponse MapToResponse(this JoinServerDto dto)
    {
        return new JoinServerResponse
        {
            ServerId = dto.ServerId,
            ChannelId = dto.ChannelId
        };
    }
}