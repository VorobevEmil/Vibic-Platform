using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.ChannelFeatures.Queries;

public record GetServerChannelParticipantsQuery(Guid ServerId, Guid ChannelId) : IRequest<List<ServerChannelParticipantDto>>;

public class GetServerChannelParticipantsHandler
    : IRequestHandler<GetServerChannelParticipantsQuery, List<ServerChannelParticipantDto>>
{
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IChannelRepository _channelRepository;

    public GetServerChannelParticipantsHandler(
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor,
        IChannelRepository channelRepository)
    {
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
        _channelRepository = channelRepository;
    }

    public async Task<List<ServerChannelParticipantDto>> Handle(
        GetServerChannelParticipantsQuery request,
        CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        Channel? channel = await _channelRepository.FindAccessibleServerChannelForUserAsync(
            userId,
            request.ServerId,
            request.ChannelId,
            cancellationToken);

        if (channel is null)
        {
            throw new NotFoundException("Channel not found");
        }

        return channel.MapToServerChannelParticipantDtos(_configuration);
    }
}
