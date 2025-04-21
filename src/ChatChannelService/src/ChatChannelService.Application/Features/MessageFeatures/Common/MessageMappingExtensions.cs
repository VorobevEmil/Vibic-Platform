using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Features.MessageFeatures.Common;

public static class MessageMappingExtensions
{
    public static MessageDto MapToDto(this Message message)
    {
        return new MessageDto(
            message.Id,
            message.Channel.Id,
            message.Content,
            message.ChatUser.Id,
            message.ChatUser.Username,
            message.ChatUser.AvatarUrl,
            message.CreatedAt);
    }
}