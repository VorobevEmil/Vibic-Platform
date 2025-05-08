using ChatChannelService.Application.Features.InviteFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.InviteFeatures.Commands;

public record JoinServerCommand(string Code) : IRequest<JoinServerDto>;

public class JoinServerHandler : IRequestHandler<JoinServerCommand, JoinServerDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IInviteRepository _inviteRepository;
    private readonly IChatUserRepository _chatUserRepository;
    private readonly IServerMemberRepository _serverMemberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public JoinServerHandler(
        IHttpContextAccessor httpContextAccessor,
        IInviteRepository inviteRepository,
        IChatUserRepository chatUserRepository,
        IServerMemberRepository serverMemberRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _inviteRepository = inviteRepository;
        _chatUserRepository = chatUserRepository;
        _serverMemberRepository = serverMemberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<JoinServerDto> Handle(JoinServerCommand request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        Invite invite = await _inviteRepository.GetByCodeAsync(request.Code, cancellationToken);

        Server server = invite.Server;
        if (server.ServerMembers.Any(sm => sm.ChatUserId == userId))
        {
            throw new BadRequestException("You have already joined the server.");
        }

        ChatUser chatUser = await _chatUserRepository.GetByIdAsync(userId, cancellationToken);

        ServerMember serverMember = new(chatUser, server);

        await _serverMemberRepository.CreateAsync(serverMember, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new JoinServerDto(server.Id, server.Channels.First().Id);
    }
}