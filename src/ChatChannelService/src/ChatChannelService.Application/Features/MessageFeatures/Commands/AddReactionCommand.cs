using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.MessageFeatures.Commands;

public record AddReactionCommand(Guid MessageId, Guid UserId, string Emoji) : IRequest<ReactionDto>;

public class AddReactionHandler : IRequestHandler<AddReactionCommand, ReactionDto>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IReactionRepository _reactionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddReactionHandler(
        IMessageRepository messageRepository,
        IReactionRepository reactionRepository,
        IUnitOfWork unitOfWork)
    {
        _messageRepository = messageRepository;
        _reactionRepository = reactionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ReactionDto> Handle(AddReactionCommand request, CancellationToken cancellationToken)
    {
        Message? message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
        if (message == null)
        {
            throw new NotFoundException("Message not found");
        }

        Reaction? existing = await _reactionRepository.GetByMessageIdUserIdAndEmojiAsync(
            request.MessageId, request.UserId, request.Emoji, cancellationToken);

        if (existing != null)
        {
            throw new InvalidOperationException("Reaction already exists");
        }

        Reaction reaction = new(message, request.UserId, request.Emoji);
        await _reactionRepository.CreateAsync(reaction, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ReactionDto(reaction.Id, reaction.Emoji, reaction.UserId, reaction.CreatedAt);
    }
}
