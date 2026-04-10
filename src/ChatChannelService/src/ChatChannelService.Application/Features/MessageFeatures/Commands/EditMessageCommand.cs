using System.ComponentModel.DataAnnotations;
using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Core.Enums;
using MediatR;
using Microsoft.Extensions.Configuration;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.MessageFeatures.Commands;

public record EditMessageCommand(
    ChannelType ChannelType,
    Guid ChannelId,
    Guid? ServerId,
    Guid MessageId,
    Guid UserId,
    string Content)
    : IRequest<MessageDto>;

public class EditMessageHandler : IRequestHandler<EditMessageCommand, MessageDto>
{
    private readonly IConfiguration _configuration;
    private readonly IChannelRepository _channelRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public EditMessageHandler(
        IConfiguration configuration,
        IChannelRepository channelRepository,
        IMessageRepository messageRepository,
        IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _channelRepository = channelRepository;
        _messageRepository = messageRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MessageDto> Handle(EditMessageCommand request, CancellationToken cancellationToken)
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
            throw new ForbiddenException("You do not have permission to edit this message");
        }

        if (request.Content == message.Content)
        {
            return message.MapToDto(_configuration);
        }

        if (!MessageContentValidator.HasMeaningfulContent(request.Content))
        {
            throw new ValidationException("Message content cannot be empty.");
        }

        message.UpdateContent(request.Content);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return message.MapToDto(_configuration);
    }
}
