namespace ChatChannelService.Application.Features.ServerFeatures.Common;

public record ServerSummaryDto(Guid Id, string? IconUrl, string Name, Guid ChannelId);