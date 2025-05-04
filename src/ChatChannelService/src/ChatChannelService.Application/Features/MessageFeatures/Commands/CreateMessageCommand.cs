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

public record CreateMessageCommand(
    ChannelType ChannelType,
    Guid ChannelId,
    Guid? ServerId,
    Guid UserId,
    string Content)
    : IRequest<MessageDto>;

public class CreateMessageHandler : IRequestHandler<CreateMessageCommand, MessageDto>
{
    private readonly IConfiguration _configuration;
    private readonly IChannelRepository _channelRepository;
    private readonly IChatUserRepository _chatUserRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMessageHandler(
        IConfiguration configuration,
        IChannelRepository channelRepository,
        IChatUserRepository chatUserRepository,
        IMessageRepository messageRepository,
        IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _channelRepository = channelRepository;
        _chatUserRepository = chatUserRepository;
        _messageRepository = messageRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MessageDto> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        if (request is { ChannelType: ChannelType.Server, ServerId: null })
        {
            throw new ValidationException("Server is required for channel type 'Server'.");
        }

        Channel? channel;

        switch (request.ChannelType)
        {
            case ChannelType.Direct:
                channel = await _channelRepository
                    .FindDirectChannelForUserAsync(request.UserId, request.ChannelId, cancellationToken);
                break;
            case ChannelType.Server:
                channel = await _channelRepository
                    .FindAccessibleServerChannelForUserAsync(
                        request.UserId,
                        request.ServerId!.Value,
                        request.ChannelId,
                        cancellationToken);
                break;
            default:
                throw new ValidationException("Channel type is invalid.");
        }

        if (channel is null)
        {
            throw new NotFoundException("Channel doesn't exist");
        }

        ChatUser senderUser = await _chatUserRepository.GetByIdAsync(request.UserId, cancellationToken);

        Message message = new(channel, senderUser, request.Content);

        await _messageRepository.CreateAsync(message, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        MessageDto messageDto = message.MapToDto(_configuration);

        return messageDto;
    }
}