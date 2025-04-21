using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Application.Features.MessageFeatures.Commands;

public record CreateMessageCommand(Guid ChannelId, Guid UserId, string Content) : IRequest<MessageDto>;

public class CreateMessageHandler : IRequestHandler<CreateMessageCommand, MessageDto>
{
    private readonly IChannelRepository _channelRepository;
    private readonly IChatUserRepository _chatUserRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMessageHandler(
        IChannelRepository channelRepository,
        IChatUserRepository chatUserRepository,
        IMessageRepository messageRepository,
        IUnitOfWork unitOfWork)
    {
        _channelRepository = channelRepository;
        _chatUserRepository = chatUserRepository;
        _messageRepository = messageRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MessageDto> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        Channel? channel = await _channelRepository
            .GetUserDirectChannelByIdAsync(request.UserId, request.ChannelId, cancellationToken);

        if (channel is null)
        {
            throw new NotFoundException("Channel doesn't exist");
        }

        ChatUser? senderUser = await _chatUserRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (senderUser is null)
        {
            throw new NotFoundException("User not found");
        }

        Message message = new(channel, senderUser, request.Content);

        await _messageRepository.CreateAsync(message, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        MessageDto messageDto = message.MapToDto();

        return messageDto;
    }
}