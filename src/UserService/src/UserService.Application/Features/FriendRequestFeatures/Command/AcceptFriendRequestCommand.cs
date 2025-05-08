using MediatR;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.EF.Interfaces;

namespace UserService.Application.Features.FriendRequestFeatures.Command;

public record AcceptFriendRequestCommand(Guid RequestId) : IRequest;

public class AcceptFriendRequestCommandHandler : IRequestHandler<AcceptFriendRequestCommand>
{
    private readonly IFriendRequestRepository _friendRequestRepository;
    private readonly IUserFriendRepository _userFriendRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AcceptFriendRequestCommandHandler(
        IFriendRequestRepository friendRequestRepository,
        IUserFriendRepository userFriendRepository,
        IUnitOfWork unitOfWork)
    {
        _friendRequestRepository = friendRequestRepository;
        _userFriendRepository = userFriendRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(AcceptFriendRequestCommand request, CancellationToken cancellationToken)
    {
        FriendRequest friendRequest = await _friendRequestRepository
            .GetByIdAsync(request.RequestId, cancellationToken);

        if (friendRequest.Status != FriendRequestStatus.Pending)
        {
            throw new InvalidOperationException("Only pending requests can be accepted.");
        }

        friendRequest.Accept();

        UserFriend userFriend1 = new(friendRequest.Sender, friendRequest.Receiver);
        UserFriend userFriend2 = new(friendRequest.Receiver, friendRequest.Sender);

        await _userFriendRepository.CreateAsync(userFriend1, cancellationToken);
        await _userFriendRepository.CreateAsync(userFriend2, cancellationToken);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}