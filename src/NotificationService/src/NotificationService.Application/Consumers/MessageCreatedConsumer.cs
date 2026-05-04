using MediatR;
using NotificationService.Application.Features.NotificationFeatures.Commands;
using NotificationService.Core.Enums;
using Vibic.Shared.Messaging.Contracts.Chat;

namespace NotificationService.Application.Consumers;

public class MessageCreatedConsumer(IMediator mediator)
{
    public async Task Handle(MessageCreatedEvent message)
    {
        foreach (var receiverId in message.ReceiverIds)
        {
            var command = new CreateNotificationCommand(
                receiverId,
                NotificationType.NewMessage,
                "New message",
                $"{message.SenderDisplayName} sent you a message",
                message.ChannelId);

            await mediator.Send(command);
        }
    }
}
