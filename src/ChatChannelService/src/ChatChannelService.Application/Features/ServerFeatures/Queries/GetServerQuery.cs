using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.ServerFeatures.Queries;

public record GetServerQuery(Guid Id) : IRequest<ServerFullDto>;

public class GetServerHandler : IRequestHandler<GetServerQuery, ServerFullDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServerRepository _serverRepository;

    public GetServerHandler(
        IHttpContextAccessor httpContextAccessor,
        IServerRepository serverRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _serverRepository = serverRepository;
    }

    public async Task<ServerFullDto> Handle(GetServerQuery request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        Server server = await _serverRepository.GetServerByIdForUserAsync(request.Id, userId, cancellationToken);

        return server.MapToServerFullDto();
    }
}