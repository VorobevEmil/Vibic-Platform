using MediatR;
using UserService.Application.Features.UserProfileFeatures.Commands;
using Vibic.Shared.Messaging.Contracts.Users;

namespace UserService.Application.Consumers;

public class CreateUserProfileHandler(IMediator mediator)
{
    public Task Handle(CreateUserProfileEvent message)
    {
        CreateUserProfileCommand command = new(message.UserId, message.DisplayName, message.Username, message.Email);
        return mediator.Send(command);
    }
}
