using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Features.ChannelFeatures;

public static class ChannelMappingExtensions
{
    public static ChannelDirectMessageDto MapToMessageDirectDto(this Channel channel)
    {
        List<ChannelMemberDto> channelMembers = channel.ChannelMembers
            .ConvertAll(cm => new ChannelMemberDto(cm.ChannelId, cm.ChatUser.Username, null));

        return new ChannelDirectMessageDto(channel.Id, channelMembers);
    }
}