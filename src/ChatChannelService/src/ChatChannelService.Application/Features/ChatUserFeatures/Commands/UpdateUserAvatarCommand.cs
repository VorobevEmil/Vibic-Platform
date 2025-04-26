using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Application.Features.ChatUserFeatures.Commands;

public record UpdateUserAvatarCommand(Guid UserId, string AvatarUrl) : IRequest;

public class UpdateUserAvatarHandler : IRequestHandler<UpdateUserAvatarCommand>
{
    private readonly IChatUserRepository _chatUserRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserAvatarHandler(
        IChatUserRepository chatUserRepository,
        IUnitOfWork unitOfWork)
    {
        _chatUserRepository = chatUserRepository;
        _unitOfWork = unitOfWork;
    }
    
    public async Task Handle(UpdateUserAvatarCommand request, CancellationToken cancellationToken)
    {
        ChatUser? chatUser = await _chatUserRepository
            .GetByIdAsync(request.UserId, cancellationToken);
        
        if (chatUser == null)
            return;
        
        chatUser.UpdateAvatarUrl(request.AvatarUrl);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}