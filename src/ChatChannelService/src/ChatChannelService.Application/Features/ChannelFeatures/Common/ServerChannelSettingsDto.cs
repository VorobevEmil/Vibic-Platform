using ChatChannelService.Core.Enums;

namespace ChatChannelService.Application.Features.ChannelFeatures.Common;

public record ServerChannelSettingsDto(
    Guid Id,
    string Name,
    ChannelType ChannelType,
    bool IsPublic,
    List<Guid> MemberIds);
