using ChatChannelService.Application.Features.InviteFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.InviteFeatures.Commands;

public record CreateInviteCommand(Guid ServerId) : IRequest<InviteDto>;

public class CreateInviteHandler : IRequestHandler<CreateInviteCommand, InviteDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServerRepository _serverRepository;
    private readonly IInviteRepository _inviteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateInviteHandler(
        IHttpContextAccessor httpContextAccessor,
        IServerRepository serverRepository,
        IInviteRepository inviteRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _serverRepository = serverRepository;
        _inviteRepository = inviteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<InviteDto> Handle(CreateInviteCommand request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        Server server = await _serverRepository.GetServerByIdAsync(request.ServerId, cancellationToken);

        if (server.OwnerId != userId)
        {
            throw new ForbiddenException("You cannot create a invite for this server.");
        }

        Invite invite = new(Guid.NewGuid().ToString("N"), server);
        await _inviteRepository.CreateAsync(invite, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new InviteDto(invite.Code);
    }
}