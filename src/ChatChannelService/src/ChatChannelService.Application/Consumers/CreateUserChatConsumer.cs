using ChatChannelService.Application.Features.ChatUserFeatures.Commands;
using MediatR;
using Vibic.Shared.Messaging.Contracts.Users;

namespace ChatChannelService.Application.Consumers;

public class CreateUserChatHandler(IMediator mediator)
{
    public Task Handle(CreateUserChatEvent message)
    {
        CreateChatUserCommand command = new(message.UserId, message.DisplayName, message.Username, message.AvatarUrl);
        return mediator.Send(command);
    }
}
