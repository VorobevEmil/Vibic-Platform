using MediatR;
using NotificationService.Application.Features.NotificationFeatures.Commands;
using NotificationService.Core.Enums;
using Vibic.Shared.Messaging.Contracts.Chat;

namespace NotificationService.Application.Consumers;

public class ServerInviteCreatedConsumer(IMediator mediator)
{
    public async Task Handle(ServerInviteCreatedEvent message)
    {
        var command = new CreateNotificationCommand(
            message.ReceiverId,
            NotificationType.ServerInviteReceived,
            "Server invite",
            $"You received an invite to join {message.ServerName}",
            message.InviteId);
        
        await mediator.Send(command);
    }
}
