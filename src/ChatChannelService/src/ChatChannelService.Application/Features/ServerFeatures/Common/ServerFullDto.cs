using ChatChannelService.Core.Enums;

namespace ChatChannelService.Application.Features.ServerFeatures.Common;

public record ServerFullDto(
    Guid Id,
    string Name,
    string? IconUrl,
    List<ServerChannelDto> Channels,
    List<ServerMemberDto> Members);

public record ServerChannelDto(Guid Id, string Name, ChannelType ChannelType, bool IsPublic);

public record ServerMemberDto(Guid UserId, string DisplayName, string Username, string? AvatarUrl);
