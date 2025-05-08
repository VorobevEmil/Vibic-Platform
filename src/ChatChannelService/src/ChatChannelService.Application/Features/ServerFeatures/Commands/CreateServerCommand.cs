using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Core.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.ServerFeatures.Commands;

public record CreateServerCommand(string Name) : IRequest<ServerSummaryDto>;

public class CreateServerHandler : IRequestHandler<CreateServerCommand, ServerSummaryDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServerRepository _serverRepository;
    private readonly IChannelRepository _channelRepository;
    private readonly IChatUserRepository _chatUserRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServerHandler(
        IHttpContextAccessor httpContextAccessor,
        IServerRepository serverRepository,
        IChannelRepository channelRepository,
        IChatUserRepository chatUserRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _serverRepository = serverRepository;
        _channelRepository = channelRepository;
        _chatUserRepository = chatUserRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServerSummaryDto> Handle(CreateServerCommand request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        ChatUser chatUser = await _chatUserRepository.GetByIdAsync(userId, cancellationToken);

        Server server = new(request.Name, chatUser);
        Channel channel = Channel.CreateServerChannel("general", server, ChannelType.Server, true);
        // ChannelMember channelMember = new(channel, chatUser);
        // channel.ChannelMembers.Add(channelMember);
        ServerMember serverMember = new(chatUser, server);
        server.Channels.Add(channel);
        server.ServerMembers.Add(serverMember);
        await _serverRepository.CreateAsync(server, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return server.MapToServerSummaryDto(channel);
    }
}