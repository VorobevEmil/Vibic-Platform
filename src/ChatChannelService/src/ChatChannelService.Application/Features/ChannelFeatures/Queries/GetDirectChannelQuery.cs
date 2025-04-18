using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.ChannelFeatures.Queries;

public record GetDirectChannelQuery(Guid id) : IRequest<DirectChannelDto>;

public class GetDirectChannelHandler : IRequestHandler<GetDirectChannelQuery, DirectChannelDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IChannelRepository _channelRepository;

    public GetDirectChannelHandler(
        IHttpContextAccessor httpContextAccessor,
        IChannelRepository channelRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _channelRepository = channelRepository;
    }
    
    public async Task<DirectChannelDto> Handle(GetDirectChannelQuery request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        Channel? channel = await _channelRepository.GetUserDirectChannelByIdAsync(userId, request.id, cancellationToken);

        if (channel is null)
        {
            throw new NotFoundException("Channel not found");
        }

        return channel.MapToDirectChannelDto();
    }
}