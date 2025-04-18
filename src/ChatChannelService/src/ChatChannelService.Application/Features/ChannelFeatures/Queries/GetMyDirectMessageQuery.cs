using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.ChannelFeatures.Queries;

public record GetMyDirectMessageQuery : IRequest<List<DirectChannelDto>>;

public class GetMyDirectMessageHandler : IRequestHandler<GetMyDirectMessageQuery, List<DirectChannelDto>>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IChannelRepository _channelRepository;

    public GetMyDirectMessageHandler(
        IHttpContextAccessor httpContextAccessor,
        IChannelRepository channelRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _channelRepository = channelRepository;
    }

    public async Task<List<DirectChannelDto>> Handle(GetMyDirectMessageQuery request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        List<Channel> channels = await _channelRepository.GetUserDirectChannelsAsync(userId, cancellationToken);

        return channels.ConvertAll(c => c.MapToDirectChannelDto());
    }
}