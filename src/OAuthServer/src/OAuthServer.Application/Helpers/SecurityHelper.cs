using System.Security.Cryptography;

namespace OAuthServer.Application.Helpers;

public static class SecurityHelper
{
    public static string GenerateClientId()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(16))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
    
    public static string GenerateSecureClientSecret(int length = 64)
    {
        using RandomNumberGenerator rng = RandomNumberGenerator.Create();
        byte[] bytes = new byte[length];
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
   
}