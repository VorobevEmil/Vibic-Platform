namespace ChatChannelService.Application.Features.ChannelFeatures.Common;

public record DirectChannelDto(Guid Id, List<ChannelMemberDto> ChannelMembers);