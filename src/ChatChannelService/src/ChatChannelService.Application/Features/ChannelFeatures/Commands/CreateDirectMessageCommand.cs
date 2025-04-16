using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Application.Features.ChannelFeatures.Commands;

public record CreateDirectMessageCommand(Guid UserId) : IRequest<ChannelDirectMessageDto>;

public class CreateDirectMessageHandler : IRequestHandler<CreateDirectMessageCommand, ChannelDirectMessageDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IChatUserRepository _chatUserRepository;
    private readonly IChannelRepository _channelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateDirectMessageHandler(
        IHttpContextAccessor httpContextAccessor,
        IChatUserRepository chatUserRepository,
        IChannelRepository channelRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _chatUserRepository = chatUserRepository;
        _channelRepository = channelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ChannelDirectMessageDto> Handle(CreateDirectMessageCommand request,
        CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        ChatUser? chatUser = await _chatUserRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (chatUser == null)
        {
            throw new NotFoundException("Chat user not found");
        }

        Channel channel = Channel.CreateDirectMessageChannel();

        foreach (Guid id in new[] { request.UserId, userId })
        {
            ChannelMember channelMember = new(channel, id);

            channel.ChannelMembers.Add(channelMember);
        }

        await _channelRepository.CreateAsync(channel, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return channel.MapToMessageDirectDto();
    }
}