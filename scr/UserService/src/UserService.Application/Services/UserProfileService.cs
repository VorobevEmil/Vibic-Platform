using UserService.Application.Interfaces;
using UserService.Core.Entities;
using UserService.Core.Interfaces;
using Vibic.Shared.Messaging.Contracts.Users;

namespace UserService.Application.Services;

public class UserProfileService : IUserProfileService
{
    private readonly IUserProfileRepository _repository;

    public UserProfileService(IUserProfileRepository repository)
    {
        _repository = repository;
    }
    

    public async Task CreateProfileAsync(UserRegistered userRegistered)
    {
        bool exists = await _repository.ExistsAsync(userRegistered.UserId);
        if (exists) return;

        UserProfile profile = new(userRegistered.UserId, userRegistered.Username, userRegistered.Email);
        await _repository.AddAsync(profile);
    }
}
