using ChatChannelService.Application.Helpers.Extensions;
using ChatChannelService.Core.Entities;
using Microsoft.Extensions.Configuration;

namespace ChatChannelService.Application.Features.MessageFeatures.Common;

public static class MessageMappingExtensions
{
    public static MessageDto MapToDto(this Message message, IConfiguration configuration)
    {
        var reactions = message.Reactions.ConvertAll(r => 
            new ReactionDto(r.Id, r.Emoji, r.UserId, r.CreatedAt));
            
        return new MessageDto(
            message.Id,
            message.Channel.Id,
            message.Content,
            message.Sender.Id,
            message.Sender.Username,
            configuration.BuildUserAvatarUrl(message.Sender.AvatarUrl),
            message.CreatedAt,
            message.UpdatedAt,
            reactions);
    }
}