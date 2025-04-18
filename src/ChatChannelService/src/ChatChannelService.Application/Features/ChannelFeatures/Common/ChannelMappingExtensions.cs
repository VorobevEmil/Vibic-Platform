using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Features.ChannelFeatures.Common;

public static class ChannelMappingExtensions
{
    public static DirectChannelDto MapToDirectChannelDto(this Channel channel)
    {
        List<ChannelMemberDto> channelMembers = channel.ChannelMembers
            .ConvertAll(cm => cm.MapToChannelMemberDto());

        return new DirectChannelDto(channel.Id, channelMembers);
    }

    private static ChannelMemberDto MapToChannelMemberDto(this ChannelMember channelMember)
    {
        return new ChannelMemberDto(
            channelMember.ChatUser.Id, 
            channelMember.ChatUser.Username, 
            "/default/vibic_avatar_1.svg");
    }
}