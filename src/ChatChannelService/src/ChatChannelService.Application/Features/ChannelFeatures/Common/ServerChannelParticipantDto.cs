namespace ChatChannelService.Application.Features.ChannelFeatures.Common;

public record ServerChannelParticipantDto(
    Guid UserId,
    string DisplayName,
    string Username,
    string? AvatarUrl);
