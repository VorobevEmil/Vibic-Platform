using MediatR;
using NotificationService.Application.Features.NotificationFeatures.Commands;
using NotificationService.Core.Enums;
using Vibic.Shared.Messaging.Contracts.Users;

namespace NotificationService.Application.Consumers;

public class FriendRequestAcceptedConsumer(IMediator mediator)
{
    public async Task Handle(FriendRequestAcceptedEvent message)
    {
        var command = new CreateNotificationCommand(
            message.SenderId,
            NotificationType.FriendRequestAccepted,
            "Friend request accepted",
            $"{message.AcceptorDisplayName} accepted your friend request",
            message.FriendId);
        
        await mediator.Send(command);
    }
}
