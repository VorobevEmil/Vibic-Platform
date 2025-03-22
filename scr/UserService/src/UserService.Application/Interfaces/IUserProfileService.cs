using Vibic.Shared.Messaging.Contracts.Users;

namespace UserService.Application.Interfaces;

public interface IUserProfileService
{
    Task CreateProfileAsync(UserRegistered userRegistered);
}