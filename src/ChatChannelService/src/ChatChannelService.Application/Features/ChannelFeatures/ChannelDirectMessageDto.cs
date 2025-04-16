namespace ChatChannelService.Application.Features.ChannelFeatures;

public record ChannelDirectMessageDto(Guid Id, List<ChannelMemberDto> ChannelMembers);