using ChatChannelService.Application.Features.ChatUserFeatures.Commands;
using MassTransit;
using MediatR;
using Vibic.Shared.Messaging.Contracts.Users;

namespace ChatChannelService.Application.Consumers;

public class CreateUserChatConsumer(IMediator mediator) : IConsumer<CreateUserChatEvent>
{
    public Task Consume(ConsumeContext<CreateUserChatEvent> context)
    {
        CreateUserChatEvent message = context.Message;
        CreateChatUserCommand command = new(message.UserId, message.Username);

        return mediator.Send(command);
    }
}