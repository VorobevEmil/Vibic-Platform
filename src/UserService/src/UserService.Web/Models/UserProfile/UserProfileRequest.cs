namespace UserService.Web.Models.UserProfile;

public class UserProfileRequest
{
    public required string Username { get; init; }
    public string? AvatarUri { get; init; }
    public string? Bio { get; init; }
}