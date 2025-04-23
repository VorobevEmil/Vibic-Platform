namespace ChatChannelService.Application.Features.ServerFeatures;

public record ServerDto(Guid Id, string? IconUrl, string Name, Guid ChannelId);