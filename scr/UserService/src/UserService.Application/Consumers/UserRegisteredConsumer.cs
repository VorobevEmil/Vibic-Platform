using MassTransit;
using MediatR;
using UserService.Application.Features.UserProfileFeatures.Create;
using Vibic.Shared.Messaging.Contracts.Users;

namespace UserService.Application.Consumers;

public class UserRegisteredConsumer : IConsumer<UserRegisteredEvent>
{
    private readonly IMediator _mediator;

    public UserRegisteredConsumer(IMediator mediator)
    {
        _mediator = mediator;
    }

    public Task Consume(ConsumeContext<UserRegisteredEvent> context)
    {
        UserRegisteredEvent message = context.Message;
        CreateUserProfileCommand command = new(message.UserId, message.Username, message.Email);

        return _mediator.Send(command);
    }
}