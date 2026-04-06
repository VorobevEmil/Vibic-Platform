using ChatChannelService.Application.Features.ServerFeatures.Common;
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

    public static List<ServerChannelParticipantDto> MapToServerChannelParticipantDtos(
        this Channel channel,
        IConfiguration configuration)
    {
        if (channel.IsPublic)
        {
            return channel.Server?.ServerMembers
                .OrderBy(serverMember => serverMember.DisplayName)
                .Select(serverMember => new ServerChannelParticipantDto(
                    serverMember.ChatUserId,
                    serverMember.ChatUser.DisplayName,
                    serverMember.ChatUser.Username,
                    configuration.BuildUserAvatarUrl(serverMember.ChatUser.AvatarUrl)))
                .ToList()
                ?? [];
        }

        return channel.ChannelMembers
            .OrderBy(channelMember => channelMember.ChatUser.DisplayName)
            .Select(channelMember => new ServerChannelParticipantDto(
                channelMember.ChatUserId,
                channelMember.ChatUser.DisplayName,
                channelMember.ChatUser.Username,
                configuration.BuildUserAvatarUrl(channelMember.ChatUser.AvatarUrl)))
            .ToList();
    }

    public static ServerChannelDto MapToServerChannelDto(this Channel channel)
    {
        return new ServerChannelDto(channel.Id, channel.Name!, channel.ChannelType, channel.IsPublic);
    }
}
