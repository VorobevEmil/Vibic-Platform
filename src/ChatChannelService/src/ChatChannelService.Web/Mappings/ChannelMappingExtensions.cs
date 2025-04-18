using ChatChannelService.Application.Features.ChannelFeatures;
using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Web.Models.Channels.Responses;

namespace ChatChannelService.Web.Mappings;

public static class ChannelMappingExtensions
{
    public static ChannelDirectChannelResponse MapToDirectMessageResponse(this DirectChannelDto dto)
    {
        return new ChannelDirectChannelResponse
        {
            Id = dto.Id,
            ChannelMembers = dto.ChannelMembers
                .ConvertAll(cm => new ChannelMemberResponse
                {
                    UserId = cm.UserId,
                    Username = cm.Username,
                    AvatarUrl = cm.AvatarUrl
                })
        };
    }
}