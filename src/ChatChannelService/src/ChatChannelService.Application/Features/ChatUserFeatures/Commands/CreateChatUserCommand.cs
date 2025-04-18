using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Application.Features.ChatUserFeatures.Commands;

public record CreateChatUserCommand(Guid UserId, string Username) : IRequest;

public class CreateChatUserHandler : IRequestHandler<CreateChatUserCommand>
{
    private readonly IChatUserRepository _chatUserRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateChatUserHandler(IChatUserRepository chatUserRepository, IUnitOfWork unitOfWork)
    {
        _chatUserRepository = chatUserRepository;
        _unitOfWork = unitOfWork;
    }
    
    public async Task Handle(CreateChatUserCommand request, CancellationToken cancellationToken)
    {
        ChatUser chatUser = new(request.UserId, request.Username);
        await _chatUserRepository.CreateAsync(chatUser);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}