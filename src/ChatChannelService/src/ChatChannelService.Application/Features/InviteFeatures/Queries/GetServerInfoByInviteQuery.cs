using ChatChannelService.Application.Features.InviteFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.InviteFeatures.Queries;

public record GetServerInfoByInviteQuery(string Code) : IRequest<InviteInfoSummaryDto>;

public class GetServerInfoByInviteHandler : IRequestHandler<GetServerInfoByInviteQuery, InviteInfoSummaryDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IInviteRepository _inviteRepository;

    public GetServerInfoByInviteHandler(
        IHttpContextAccessor httpContextAccessor,
        IInviteRepository inviteRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _inviteRepository = inviteRepository;
    }

    public async Task<InviteInfoSummaryDto> Handle(
        GetServerInfoByInviteQuery request,
        CancellationToken cancellationToken)
    {
        Invite invite = await _inviteRepository.GetByCodeAsync(request.Code, cancellationToken);

        Server server = invite.Server;

        return new InviteInfoSummaryDto(server.Name, server.IconUrl);
    }
}