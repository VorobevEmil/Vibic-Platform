namespace ChatChannelService.Application.Features.ChannelFeatures.Common;

public record ChannelMemberDto(Guid UserId, string DisplayName, string AvatarUrl);