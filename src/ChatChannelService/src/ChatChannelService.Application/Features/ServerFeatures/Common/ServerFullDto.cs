using ChatChannelService.Core.Enums;

namespace ChatChannelService.Application.Features.ServerFeatures.Common;

public record ServerFullDto(Guid Id, string Name, string? IconUrl, List<ServerChannelDto> Channels);

public record ServerChannelDto(Guid Id, string Name, ChannelType ChannelType, bool IsPublic);
