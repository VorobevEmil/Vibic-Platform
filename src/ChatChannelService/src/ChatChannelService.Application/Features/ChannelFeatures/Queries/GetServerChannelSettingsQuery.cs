using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Repositories;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.ChannelFeatures.Queries;

public record GetServerChannelSettingsQuery(Guid ServerId, Guid ChannelId) : IRequest<ServerChannelSettingsDto>;

public class GetServerChannelSettingsHandler
    : IRequestHandler<GetServerChannelSettingsQuery, ServerChannelSettingsDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IChannelRepository _channelRepository;

    public GetServerChannelSettingsHandler(
        IHttpContextAccessor httpContextAccessor,
        IChannelRepository channelRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _channelRepository = channelRepository;
    }

    public async Task<ServerChannelSettingsDto> Handle(
        GetServerChannelSettingsQuery request,
        CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        var channel = await _channelRepository.GetServerChannelByIdForOwnerAsync(
            request.ServerId,
            request.ChannelId,
            userId,
            cancellationToken);

        return new ServerChannelSettingsDto(
            channel.Id,
            channel.Name ?? string.Empty,
            channel.ChannelType,
            channel.IsPublic,
            channel.ChannelMembers
                .Select(channelMember => channelMember.ChatUserId)
                .ToList());
    }
}
