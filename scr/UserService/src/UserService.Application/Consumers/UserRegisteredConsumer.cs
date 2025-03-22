using MassTransit;
using UserService.Application.Interfaces;
using Vibic.Shared.Messaging.Contracts.Users;

namespace UserService.Application.Consumers;

public class UserRegisteredConsumer : IConsumer<UserRegistered>
{
    private readonly IUserProfileService _profileService;

    public UserRegisteredConsumer(IUserProfileService profileService)
    {
        _profileService = profileService;
    }

    public Task Consume(ConsumeContext<UserRegistered> context)
    {
        return _profileService.CreateProfileAsync(context.Message);
    }
}