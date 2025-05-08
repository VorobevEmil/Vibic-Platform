using MediatR;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.EF.Interfaces;

namespace UserService.Application.Features.FriendRequestFeatures.Command;

public record RejectFriendRequestCommand(Guid RequestId) : IRequest;

public class RejectFriendRequestCommandHandler : IRequestHandler<RejectFriendRequestCommand>
{
    private readonly IFriendRequestRepository _friendRequestRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RejectFriendRequestCommandHandler(
        IFriendRequestRepository friendRequestRepository,
        IUnitOfWork unitOfWork)
    {
        _friendRequestRepository = friendRequestRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RejectFriendRequestCommand request, CancellationToken cancellationToken)
    {
        FriendRequest friendRequest = await _friendRequestRepository
            .GetByIdAsync(request.RequestId, cancellationToken);

        if (friendRequest.Status != FriendRequestStatus.Pending)
        {
            throw new InvalidOperationException("Only pending requests can be rejected.");
        }
        
        friendRequest.Reject();
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}