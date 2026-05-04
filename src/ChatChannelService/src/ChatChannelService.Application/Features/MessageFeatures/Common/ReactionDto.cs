namespace ChatChannelService.Application.Features.MessageFeatures.Common;

public record ReactionDto(
    Guid Id,
    string Emoji,
    Guid UserId,
    DateTime CreatedAt);
