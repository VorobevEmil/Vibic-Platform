using MassTransit;
using MediatR;
using UserService.Application.Features.UserProfileFeatures.Commands;
using Vibic.Shared.Messaging.Contracts.Users;

namespace UserService.Application.Consumers;

public class CreateUserProfileConsumer(IMediator mediator) : IConsumer<CreateUserProfileEvent>
{
    public Task Consume(ConsumeContext<CreateUserProfileEvent> context)
    {
        CreateUserProfileEvent message = context.Message;
        CreateUserProfileCommand command = new(message.UserId, message.Username, message.Email);

        return mediator.Send(command);
    }
}