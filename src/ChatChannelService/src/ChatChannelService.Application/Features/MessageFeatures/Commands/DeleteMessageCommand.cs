using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Core.Enums;
using MediatR;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.MessageFeatures.Commands;

public record DeleteMessageCommand(
    ChannelType ChannelType,
    Guid ChannelId,
    Guid? ServerId,
    Guid MessageId,
    Guid UserId)
    : IRequest;

public class DeleteMessageHandler : IRequestHandler<DeleteMessageCommand>
{
    private readonly IChannelRepository _channelRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteMessageHandler(
        IChannelRepository channelRepository,
        IMessageRepository messageRepository,
        IUnitOfWork unitOfWork)
    {
        _channelRepository = channelRepository;
        _messageRepository = messageRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        Channel? channel = request.ChannelType switch
        {
            ChannelType.Direct => await _channelRepository
                .FindDirectChannelForUserAsync(request.UserId, request.ChannelId, cancellationToken),
            ChannelType.Server => await _channelRepository
                .FindAccessibleServerChannelForUserAsync(
                    request.UserId,
                    request.ServerId!.Value,
                    request.ChannelId,
                    cancellationToken),
            _ => null
        };

        if (channel is null)
        {
            throw new NotFoundException("Channel doesn't exist");
        }

        Message? message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);

        if (message is null || message.ChannelId != request.ChannelId)
        {
            throw new NotFoundException("Message doesn't exist");
        }

        if (message.SenderId != request.UserId)
        {
            throw new ForbiddenException("You do not have permission to delete this message");
        }

        _messageRepository.Delete(message);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
