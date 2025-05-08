using ChatChannelService.Application.Features.ChannelFeatures;
using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Web.Models.Channels.Responses;
using ChatChannelService.Web.Models.Servers.Responses;

namespace ChatChannelService.Web.Mappings;

public static class ChannelMappingExtensions
{
    public static DirectChannelResponse MapToDirectMessageResponse(this DirectChannelDto dto)
    {
        return new DirectChannelResponse
        {
            Id = dto.Id,
            ChannelMembers = dto.ChannelMembers
                .ConvertAll(cm => new ChannelMemberResponse
                {
                    UserId = cm.UserId,
                    DisplayName = cm.DisplayName,
                    AvatarUrl = cm.AvatarUrl
                })
        };
    }

    public static ServerChannelResponse MapToServerChannelResponse(this ServerChannelDto dto)
    {
        return new ServerChannelResponse
        {
            Id = dto.Id,
            Name = dto.Name,
            ChannelType = dto.ChannelType,
            IsPublic = dto.IsPublic
        };
    }
}