using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.ChannelFeatures.Queries;

public record GetMyDirectMessageQuery : IRequest<List<ChannelDirectMessageDto>>;

public class GetMyDirectMessageHandler : IRequestHandler<GetMyDirectMessageQuery, List<ChannelDirectMessageDto>>
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

    public async Task<List<ChannelDirectMessageDto>> Handle(GetMyDirectMessageQuery request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        List<Channel> channels = await _channelRepository.GetUserDirectMessageChannelsAsync(userId, cancellationToken);

        return channels.ConvertAll(c => c.MapToMessageDirectDto());
    }
}