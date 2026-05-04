using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.MessageFeatures.Commands;

public record RemoveReactionCommand(Guid MessageId, Guid UserId, string Emoji) : IRequest;

public class RemoveReactionHandler : IRequestHandler<RemoveReactionCommand>
{
    private readonly IReactionRepository _reactionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveReactionHandler(
        IReactionRepository reactionRepository,
        IUnitOfWork unitOfWork)
    {
        _reactionRepository = reactionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RemoveReactionCommand request, CancellationToken cancellationToken)
    {
        Reaction? reaction = await _reactionRepository.GetByMessageIdUserIdAndEmojiAsync(
            request.MessageId, request.UserId, request.Emoji, cancellationToken);
        
        if (reaction == null)
        {
            throw new NotFoundException("Reaction not found");
        }

        _reactionRepository.Delete(reaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
