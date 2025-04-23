using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Application.Features.ServerFeatures.Commands;

public record CreateServerCommand(string Name) : IRequest<ServerDto>;

public class CreateServerHandler : IRequestHandler<CreateServerCommand, ServerDto>
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
    
    public async Task<ServerDto> Handle(CreateServerCommand request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        ChatUser? chatUser = await _chatUserRepository.GetByIdAsync(userId, cancellationToken);
        if (chatUser == null)
        {
            throw new NotFoundException("Chat user not found");
        }
        
        Server server = new(request.Name, chatUser);
        Channel channel = Channel.CreateServerChannel("general", server);
        ChannelMember channelMember = new(channel, chatUser);
        channel.ChannelMembers.Add(channelMember);
        ServerMember serverMember = new (chatUser, server);
        server.Channels.Add(channel);
        server.ServerMembers.Add(serverMember);
        await _serverRepository.CreateAsync(server, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return new ServerDto(server.Id, server.IconUrl, server.Name, channel.Id);
    }
}