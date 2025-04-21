using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Web.Models.Messages.Responses;

namespace ChatChannelService.Web.Mappings;

public static class MessageMappingExtensions
{
    public static MessageResponse MapToResponse(this MessageDto messageDto)
    {
        return new MessageResponse
        {
            Id = messageDto.Id,
            ChannelId = messageDto.ChannelId,
            Content = messageDto.Content,
            SenderId = messageDto.SenderId,
            SenderUsername = messageDto.SenderUsername,
            SenderAvatarUrl = messageDto.SenderAvatarUrl,
            SentAt = messageDto.SentAt
        };
    }
}