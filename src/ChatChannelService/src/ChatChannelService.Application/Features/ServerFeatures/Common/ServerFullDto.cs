namespace ChatChannelService.Application.Features.ServerFeatures.Common;

public record ServerFullDto(Guid Id, string Name, List<ServerChannelDto> Channels);

public record ServerChannelDto(Guid Id, string Name, bool IsPrivate);
