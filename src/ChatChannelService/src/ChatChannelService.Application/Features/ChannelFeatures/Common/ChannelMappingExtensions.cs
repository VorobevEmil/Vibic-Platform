using ChatChannelService.Application.Helpers.Extensions;
using ChatChannelService.Core.Entities;
using Microsoft.Extensions.Configuration;

namespace ChatChannelService.Application.Features.ChannelFeatures.Common;

public static class ChannelMappingExtensions
{
    public static DirectChannelDto MapToDirectChannelDto(this Channel channel, IConfiguration configuration)
    {
        List<ChannelMemberDto> channelMembers = channel.ChannelMembers
            .ConvertAll(cm => cm.MapToChannelMemberDto(configuration));

        return new DirectChannelDto(channel.Id, channelMembers);
    }

    private static ChannelMemberDto MapToChannelMemberDto(this ChannelMember channelMember, IConfiguration configuration)
    {
        return new ChannelMemberDto(
            channelMember.ChatUser.Id,
            channelMember.ChatUser.DisplayName,
            configuration.BuildUserAvatarUrl(channelMember.ChatUser.AvatarUrl));
    }
}