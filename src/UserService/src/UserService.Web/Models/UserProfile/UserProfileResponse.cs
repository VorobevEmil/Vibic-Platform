using UserService.Core.Enums;

namespace UserService.Web.Models.UserProfile;

public class UserProfileResponse
{
    public Guid Id { get; init; }
    public required string Username { get; init; }
    public string? AvatarUrl { get; init; }
    public string? Bio { get; init; }
    public UserStatus UserStatus { get; init; }
}