using ChatChannelService.Application.Features.ChatUserFeatures.Commands;
using MediatR;
using Vibic.Shared.Messaging.Contracts.Users;

namespace ChatChannelService.Application.Consumers;

public class UpdateUserAvatarHandler(IMediator mediator)
{
    public Task Handle(UpdateUserAvatarEvent message)
    {
        UpdateUserAvatarCommand command = new(message.UserId, message.AvatarUrl);
        return mediator.Send(command);
    }
}
