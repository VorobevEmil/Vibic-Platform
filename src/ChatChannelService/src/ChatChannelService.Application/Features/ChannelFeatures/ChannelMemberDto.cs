namespace ChatChannelService.Application.Features.ChannelFeatures;

public record ChannelMemberDto(Guid UserId, string Username, string? AvatarUrl);