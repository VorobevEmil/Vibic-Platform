using Microsoft.AspNetCore.Http;

namespace UserService.Application.Helpers;

public static class HttpRequestExtensions
{
    public static string GetAbsoluteUrl(this HttpRequest request, string relativePath)
    {
        relativePath = relativePath.TrimStart('/');

        if (Uri.IsWellFormedUriString(relativePath, UriKind.Absolute))
        {
            return relativePath;
        }

        return $"/{relativePath}";
    }
}
