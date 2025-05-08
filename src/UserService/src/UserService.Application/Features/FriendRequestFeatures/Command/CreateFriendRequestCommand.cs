using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace UserService.Application.Features.FriendRequestFeatures.Command;

public record CreateFriendRequestCommand(Guid ReceiverId) : IRequest;

public class CreateFriendRequestCommandHandler : IRequestHandler<CreateFriendRequestCommand>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserProfileRepository _userProfileRepository;
    private readonly IFriendRequestRepository _friendRequestRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFriendRequestCommandHandler(
        IHttpContextAccessor httpContextAccessor,
        IUserProfileRepository userProfileRepository,
        IFriendRequestRepository friendRequestRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _userProfileRepository = userProfileRepository;
        _friendRequestRepository = friendRequestRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CreateFriendRequestCommand request, CancellationToken cancellationToken)
    {
        Guid senderId = _httpContextAccessor.HttpContext!.User.GetUserId();
        UserProfile sender = await _userProfileRepository.GetByIdAsync(senderId, cancellationToken);
        UserProfile receiver = await _userProfileRepository.GetByIdAsync(request.ReceiverId, cancellationToken);

        FriendRequest friendRequest = new(sender, receiver);
        await _friendRequestRepository.CreateAsync(friendRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}