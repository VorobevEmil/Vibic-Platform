namespace ChatChannelService.Application.Features.MessageFeatures.Common;

public record MessageDto(
    Guid Id,
    Guid ChannelId,
    string Content,
    Guid SenderId,
    string SenderUsername,
    string SenderAvatarUrl,
    DateTime SentAt
);