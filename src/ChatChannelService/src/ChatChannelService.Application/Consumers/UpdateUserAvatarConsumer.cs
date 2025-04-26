using ChatChannelService.Application.Features.ChatUserFeatures.Commands;
using MassTransit;
using MediatR;
using Vibic.Shared.Messaging.Contracts.Users;

namespace ChatChannelService.Application.Consumers;

public class UpdateUserAvatarConsumer(IMediator mediator) : IConsumer<UpdateUserAvatarEvent>
{
    public async Task Consume(ConsumeContext<UpdateUserAvatarEvent> context)
    {
        UpdateUserAvatarEvent message = context.Message;
        UpdateUserAvatarCommand command = new(message.UserId, message.AvatarUrl);
        await mediator.Send(command);
    }
}