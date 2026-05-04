using MediatR;
using NotificationService.Application.Features.NotificationFeatures.Commands;
using NotificationService.Core.Enums;
using Vibic.Shared.Messaging.Contracts.Users;

namespace NotificationService.Application.Consumers;

public class FriendRequestCreatedConsumer(IMediator mediator)
{
    public async Task Handle(FriendRequestCreatedEvent message)
    {
        var command = new CreateNotificationCommand(
            message.ReceiverId,
            NotificationType.FriendRequestReceived,
            "New friend request",
            $"{message.SenderDisplayName} sent you a friend request",
            message.RequestId);
        
        await mediator.Send(command);
    }
}
