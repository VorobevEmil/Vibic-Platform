using Microsoft.Extensions.Configuration;

namespace ChatChannelService.Application.Helpers.Extensions;

public static class ConfigurationExtensions
{
    public static string BuildUserAvatarUrl(this IConfiguration configuration, string avatarUrl)
    {
        avatarUrl = avatarUrl.Trim('/');
        return $"{configuration["UserService:Url"]}/{avatarUrl}";
    }
}