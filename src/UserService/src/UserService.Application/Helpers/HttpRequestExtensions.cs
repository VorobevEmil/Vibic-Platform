using Microsoft.AspNetCore.Http;

namespace UserService.Application.Helpers;

public static class HttpRequestExtensions
{
    public static string GetAbsoluteUrl(this HttpRequest request, string relativePath)
    {
        string domain = request.Host.Value!;
        string scheme = request.Scheme;

        relativePath = relativePath.TrimStart('/');

        return $"{scheme}://{domain}/{relativePath}";
    }
}