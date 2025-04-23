using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.ServerFeatures.Queries;

public record GetAllMyServersQuery : IRequest<List<ServerDto>>;

public class GetAllMyServersHandler : IRequestHandler<GetAllMyServersQuery, List<ServerDto>>
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

    public async Task<List<ServerDto>> Handle(GetAllMyServersQuery request, CancellationToken cancellationToken)
    {
        HttpContext httpContext = _httpContextAccessor.HttpContext!;
        Guid userId = httpContext.User.GetUserId();

        List<Server> servers = await _serverRepository.GetServersByUserIdAsync(userId, cancellationToken);

        List<ServerDto> serversDto = new();
        foreach (Server server in servers)
        {
            Channel channel = await _channelRepository.GetFirstChannelOfServerAsync(server.Id, cancellationToken);
            ServerDto serverDto = new(
                server.Id,
                server.IconUrl,
                server.Name,
                channel.Id);
            
            serversDto.Add(serverDto);
        }

        return serversDto;
    }
}