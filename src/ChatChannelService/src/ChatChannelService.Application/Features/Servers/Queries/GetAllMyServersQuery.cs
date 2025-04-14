using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.Servers.Queries;

public record GetAllMyServersQuery() : IRequest<List<ServerDto>>;

public class GetAllMyServersHandler : IRequestHandler<GetAllMyServersQuery, List<ServerDto>>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServerRepository _serverRepository;

    public GetAllMyServersHandler(
        IHttpContextAccessor httpContextAccessor,
        IServerRepository serverRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _serverRepository = serverRepository;
    }

    public async Task<List<ServerDto>> Handle(GetAllMyServersQuery request, CancellationToken cancellationToken)
    {
        HttpContext httpContext = _httpContextAccessor.HttpContext!;
        Guid userId = httpContext.User.GetUserId();

        List<Server> servers = await _serverRepository.GetServersByUserIdAsync(userId, cancellationToken);

        return servers.ConvertAll(s => new ServerDto(
            s.Id,
            s.Name));
    }
}