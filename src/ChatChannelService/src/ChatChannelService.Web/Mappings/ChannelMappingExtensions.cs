using ChatChannelService.Application.Features.ChannelFeatures;
using ChatChannelService.Web.Models.Channels.Responses;

namespace ChatChannelService.Web.Mappings;

public static class ChannelMappingExtensions
{
    public static ChannelDirectMessageResponse MapToDirectMessageResponse(this ChannelDirectMessageDto dto)
    {
        return new ChannelDirectMessageResponse
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