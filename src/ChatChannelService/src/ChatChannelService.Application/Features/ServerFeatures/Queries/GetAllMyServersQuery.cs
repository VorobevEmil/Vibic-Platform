using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.ServerFeatures.Queries;

public record GetAllMyServersQuery : IRequest<List<ServerSummaryDto>>;

public class GetAllMyServersHandler : IRequestHandler<GetAllMyServersQuery, List<ServerSummaryDto>>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServerRepository _serverRepository;
    private readonly IChannelRepository _channelRepository;

    public GetAllMyServersHandler(
        IHttpContextAccessor httpContextAccessor,
        IServerRepository serverRepository,
        IChannelRepository channelRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _serverRepository = serverRepository;
        _channelRepository = channelRepository;
    }

    public async Task<List<ServerSummaryDto>> Handle(GetAllMyServersQuery request, CancellationToken cancellationToken)
    {
        HttpContext httpContext = _httpContextAccessor.HttpContext!;
        Guid userId = httpContext.User.GetUserId();

        List<Server> servers = await _serverRepository.GetServersByUserIdAsync(userId, cancellationToken);

        List<ServerSummaryDto> serverSummariesDto = new();
        foreach (Server server in servers)
        {
            Channel channel = await _channelRepository.GetFirstChannelOfServerAsync(server.Id, cancellationToken);
            ServerSummaryDto serverSummaryDto = server.MapToServerSummaryDto(channel);

            serverSummariesDto.Add(serverSummaryDto);
        }

        return serverSummariesDto;
    }
}