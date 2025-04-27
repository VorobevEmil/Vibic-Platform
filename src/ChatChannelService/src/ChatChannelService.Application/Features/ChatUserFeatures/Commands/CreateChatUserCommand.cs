using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.ChatUserFeatures.Commands;

public record CreateChatUserCommand(Guid UserId, string DisplayName, string Username, string AvatarUrl) : IRequest;

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
        ChatUser chatUser = new(request.UserId, request.DisplayName, request.Username, request.AvatarUrl);
        await _chatUserRepository.CreateAsync(chatUser, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}