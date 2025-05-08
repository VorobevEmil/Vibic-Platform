using Vibic.Shared.EF.Entities;

namespace UserService.Core.Entities;

public class FriendRequest : BaseEntity
{
    private FriendRequest(){}
    
    public FriendRequest(UserProfile sender, UserProfile receiver)
    {
        Sender = sender;
        SenderId = sender.Id;
        Receiver = receiver;
        ReceiverId = receiver.Id;
        Status = FriendRequestStatus.Pending;
    }
    
    public Guid SenderId { get; init; }
    public UserProfile Sender { get; init; }

    public Guid ReceiverId { get; init; }
    public UserProfile Receiver { get; init; }

    public FriendRequestStatus Status { get; private set; } 
    
    public void Accept()
    {
        Status = FriendRequestStatus.Accepted;
    }

    public void Reject()
    {
        Status = FriendRequestStatus.Rejected;
    }
}

public enum FriendRequestStatus
{
    Pending,
    Accepted,
    Rejected
}
