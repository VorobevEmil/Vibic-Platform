using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using ChatChannelService.Web.Models.Channels.Responses;

namespace ChatChannelService.Web.Services;

public interface ILinkPreviewService
{
    Task<LinkPreviewResponse> GetPreviewAsync(string url, CancellationToken cancellationToken);
}

public partial class LinkPreviewService(HttpClient httpClient, ILogger<LinkPreviewService> logger) : ILinkPreviewService
{
    private const int MaxRedirects = 5;
    private const int MaxHtmlBytes = 128 * 1024;

    public async Task<LinkPreviewResponse> GetPreviewAsync(string url, CancellationToken cancellationToken)
    {
        if (!TryCreateHttpUri(url, out Uri? parsedUri) || parsedUri is null)
        {
            return CreateFallback(url);
        }

        Uri currentUri = parsedUri;

        if (!await IsAllowedUriAsync(currentUri, cancellationToken))
        {
            logger.LogInformation("Link preview rejected for unsafe URL {Url}", url);
            return CreateFallback(url);
        }

        for (int redirectCount = 0; redirectCount <= MaxRedirects; redirectCount++)
        {
            try
            {
                using HttpRequestMessage request = CreateRequest(currentUri);
                using HttpResponseMessage response = await httpClient.SendAsync(
                    request,
                    HttpCompletionOption.ResponseHeadersRead,
                    cancellationToken);

                if (IsRedirect(response.StatusCode) && response.Headers.Location is Uri location)
                {
                    Uri nextUri = location.IsAbsoluteUri ? location : new Uri(currentUri, location);

                    if (!await IsAllowedUriAsync(nextUri, cancellationToken))
                    {
                        logger.LogInformation("Link preview redirect rejected for unsafe URL {Url}", nextUri);
                        return CreateFallback(url, currentUri);
                    }

                    currentUri = nextUri;
                    continue;
                }

                string mediaType = response.Content.Headers.ContentType?.MediaType?.ToLowerInvariant() ?? string.Empty;
                Uri finalUri = response.RequestMessage?.RequestUri ?? currentUri;

                if (!response.IsSuccessStatusCode)
                {
                    return CreateFallback(url, finalUri, mediaType);
                }

                if (mediaType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                {
                    return CreateImagePreview(url, finalUri, mediaType);
                }

                if (!string.IsNullOrWhiteSpace(mediaType) &&
                    !mediaType.Contains("html", StringComparison.OrdinalIgnoreCase))
                {
                    return CreateFallback(url, finalUri, mediaType);
                }

                string html = await ReadLimitedStringAsync(response, cancellationToken);

                if (string.IsNullOrWhiteSpace(html))
                {
                    return CreateFallback(url, finalUri, mediaType);
                }

                LinkPreviewResponse preview = BuildWebsitePreview(url, finalUri, mediaType, html);

                return string.IsNullOrWhiteSpace(preview.Title)
                    && string.IsNullOrWhiteSpace(preview.Description)
                    && string.IsNullOrWhiteSpace(preview.ImageUrl)
                    ? CreateFallback(url, finalUri, mediaType)
                    : preview;
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.LogDebug(ex, "Failed to load link preview for {Url}", url);
                return CreateFallback(url, currentUri);
            }
        }

        return CreateFallback(url, currentUri);
    }

    private static HttpRequestMessage CreateRequest(Uri uri)
    {
        HttpRequestMessage request = new(HttpMethod.Get, uri);
        request.Headers.UserAgent.ParseAdd("Vibic-LinkPreview/1.0");
        request.Headers.Accept.ParseAdd("text/html,application/xhtml+xml,image/*;q=0.95,*/*;q=0.2");
        request.Headers.AcceptLanguage.ParseAdd("en-US,en;q=0.8");
        return request;
    }

    private static bool TryCreateHttpUri(string url, out Uri? uri)
    {
        uri = null;

        if (string.IsNullOrWhiteSpace(url) ||
            !Uri.TryCreate(url.Trim(), UriKind.Absolute, out Uri? parsedUri))
        {
            return false;
        }

        if (!parsedUri.Scheme.Equals(Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase) &&
            !parsedUri.Scheme.Equals(Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (!string.IsNullOrWhiteSpace(parsedUri.UserInfo))
        {
            return false;
        }

        if (!parsedUri.IsDefaultPort && parsedUri.Port is not 80 and not 443)
        {
            return false;
        }

        uri = parsedUri;
        return true;
    }

    private static bool IsRedirect(HttpStatusCode statusCode)
    {
        int code = (int)statusCode;
        return code is 301 or 302 or 303 or 307 or 308;
    }

    private async Task<bool> IsAllowedUriAsync(Uri uri, CancellationToken cancellationToken)
    {
        string host = uri.Host.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(host) ||
            host is "localhost" or "0.0.0.0" ||
            host.EndsWith(".localhost", StringComparison.Ordinal) ||
            host.EndsWith(".local", StringComparison.Ordinal) ||
            host.EndsWith(".internal", StringComparison.Ordinal))
        {
            return false;
        }

        if (IPAddress.TryParse(host, out IPAddress? parsedAddress))
        {
            return !IsPrivateOrReserved(parsedAddress);
        }

        try
        {
            IPAddress[] addresses = await Dns.GetHostAddressesAsync(host, cancellationToken);
            return addresses.Length > 0 && addresses.All(address => !IsPrivateOrReserved(address));
        }
        catch
        {
            return false;
        }
    }

    private static bool IsPrivateOrReserved(IPAddress address)
    {
        if (IPAddress.IsLoopback(address) || address.Equals(IPAddress.Any) || address.Equals(IPAddress.IPv6Any))
        {
            return true;
        }

        if (address.AddressFamily == AddressFamily.InterNetworkV6)
        {
            if (address.IsIPv4MappedToIPv6)
            {
                return IsPrivateOrReserved(address.MapToIPv4());
            }

            return address.IsIPv6LinkLocal
                   || address.IsIPv6Multicast
                   || address.IsIPv6SiteLocal
                   || address.Equals(IPAddress.IPv6Loopback);
        }

        byte[] bytes = address.GetAddressBytes();

        return bytes[0] switch
        {
            0 => true,
            10 => true,
            100 when bytes[1] >= 64 && bytes[1] <= 127 => true,
            127 => true,
            169 when bytes[1] == 254 => true,
            172 when bytes[1] >= 16 && bytes[1] <= 31 => true,
            192 when bytes[1] == 0 && bytes[2] == 0 => true,
            192 when bytes[1] == 168 => true,
            198 when bytes[1] is 18 or 19 => true,
            _ => false
        };
    }

    private static async Task<string> ReadLimitedStringAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken)
    {
        await using Stream stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using MemoryStream buffer = new();

        byte[] chunk = new byte[8192];
        int totalRead = 0;

        while (totalRead < MaxHtmlBytes)
        {
            int bytesToRead = Math.Min(chunk.Length, MaxHtmlBytes - totalRead);
            int read = await stream.ReadAsync(chunk.AsMemory(0, bytesToRead), cancellationToken);

            if (read == 0)
            {
                break;
            }

            await buffer.WriteAsync(chunk.AsMemory(0, read), cancellationToken);
            totalRead += read;
        }

        Encoding encoding = TryGetEncoding(response.Content.Headers.ContentType?.CharSet) ?? Encoding.UTF8;
        return encoding.GetString(buffer.ToArray());
    }

    private static Encoding? TryGetEncoding(string? charSet)
    {
        if (string.IsNullOrWhiteSpace(charSet))
        {
            return null;
        }

        try
        {
            return Encoding.GetEncoding(charSet.Trim('"'));
        }
        catch
        {
            return null;
        }
    }

    private static LinkPreviewResponse BuildWebsitePreview(string originalUrl, Uri finalUri, string mediaType, string html)
    {
        string? title = FirstNonEmpty(
            ExtractMetaContent(html, "og:title", "property"),
            ExtractMetaContent(html, "twitter:title", "name"),
            ExtractTitle(html));

        string? description = FirstNonEmpty(
            ExtractMetaContent(html, "og:description", "property"),
            ExtractMetaContent(html, "twitter:description", "name"),
            ExtractMetaContent(html, "description", "name"));

        string? imageUrl = FirstNonEmpty(
            ExtractMetaContent(html, "og:image", "property"),
            ExtractMetaContent(html, "twitter:image", "name"));

        string? siteName = FirstNonEmpty(
            ExtractMetaContent(html, "og:site_name", "property"),
            finalUri.Host);

        string? faviconUrl = FirstNonEmpty(
            ExtractLinkHref(html, "icon"),
            ExtractLinkHref(html, "shortcut icon"));

        return new LinkPreviewResponse
        {
            Url = originalUrl,
            FinalUrl = finalUri.ToString(),
            Kind = "website",
            Title = title,
            Description = description,
            ImageUrl = ResolveRelativeUrl(finalUri, imageUrl),
            SiteName = siteName,
            FaviconUrl = ResolveRelativeUrl(finalUri, faviconUrl),
            ContentType = mediaType
        };
    }

    private static LinkPreviewResponse CreateImagePreview(string originalUrl, Uri finalUri, string mediaType)
    {
        string fileName = Uri.UnescapeDataString(finalUri.Segments.LastOrDefault() ?? string.Empty).Trim('/');

        return new LinkPreviewResponse
        {
            Url = originalUrl,
            FinalUrl = finalUri.ToString(),
            Kind = "image",
            Title = string.IsNullOrWhiteSpace(fileName) ? finalUri.Host : fileName,
            ImageUrl = finalUri.ToString(),
            SiteName = finalUri.Host,
            ContentType = mediaType
        };
    }

    private static LinkPreviewResponse CreateFallback(string originalUrl, Uri? finalUri = null, string? mediaType = null)
    {
        string finalUrl = finalUri?.ToString() ?? originalUrl;
        string? siteName = TryCreateHttpUri(finalUrl, out Uri? parsedUri) && parsedUri is not null
            ? parsedUri.Host
            : null;

        return new LinkPreviewResponse
        {
            Url = originalUrl,
            FinalUrl = finalUrl,
            Kind = "link",
            Title = null,
            Description = null,
            ImageUrl = null,
            SiteName = siteName,
            FaviconUrl = null,
            ContentType = mediaType
        };
    }

    private static string? ExtractTitle(string html)
    {
        Match match = TitleRegex().Match(html);
        return match.Success ? NormalizeText(match.Groups["value"].Value) : null;
    }

    private static string? ExtractMetaContent(string html, string key, string keyAttribute)
    {
        foreach (Match tagMatch in MetaTagRegex().Matches(html))
        {
            Dictionary<string, string> attributes = ParseAttributes(tagMatch.Value);

            if (!attributes.TryGetValue("content", out string? contentValue))
            {
                continue;
            }

            if (attributes.TryGetValue(keyAttribute, out string? attributeValue) &&
                attributeValue.Equals(key, StringComparison.OrdinalIgnoreCase))
            {
                return NormalizeText(contentValue);
            }
        }

        return null;
    }

    private static string? ExtractLinkHref(string html, string rel)
    {
        foreach (Match tagMatch in LinkTagRegex().Matches(html))
        {
            Dictionary<string, string> attributes = ParseAttributes(tagMatch.Value);

            if (!attributes.TryGetValue("rel", out string? relValue) ||
                !attributes.TryGetValue("href", out string? hrefValue))
            {
                continue;
            }

            string normalizedRel = NormalizeText(relValue) ?? string.Empty;

            if (normalizedRel.Equals(rel, StringComparison.OrdinalIgnoreCase))
            {
                return hrefValue.Trim();
            }
        }

        return null;
    }

    private static Dictionary<string, string> ParseAttributes(string htmlTag)
    {
        Dictionary<string, string> attributes = new(StringComparer.OrdinalIgnoreCase);

        foreach (Match match in AttributeRegex().Matches(htmlTag))
        {
            string name = match.Groups["name"].Value;
            string value = match.Groups["dq"].Success
                ? match.Groups["dq"].Value
                : match.Groups["sq"].Success
                    ? match.Groups["sq"].Value
                    : match.Groups["bare"].Value;

            attributes[name] = WebUtility.HtmlDecode(value);
        }

        return attributes;
    }

    private static string? ResolveRelativeUrl(Uri baseUri, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return Uri.TryCreate(baseUri, value.Trim(), out Uri? resolvedUri) ? resolvedUri.ToString() : null;
    }

    private static string? FirstNonEmpty(params string?[] values)
    {
        return values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));
    }

    private static string? NormalizeText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        string decoded = WebUtility.HtmlDecode(value);
        string normalized = WhitespaceRegex().Replace(decoded, " ").Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    [GeneratedRegex("<title[^>]*>(?<value>[\\s\\S]*?)</title>", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex TitleRegex();

    [GeneratedRegex("<meta\\b[^>]*>", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex MetaTagRegex();

    [GeneratedRegex("<link\\b[^>]*>", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex LinkTagRegex();

    [GeneratedRegex("(?<name>[a-zA-Z_:][-a-zA-Z0-9_:.]*)\\s*=\\s*(?:\"(?<dq>[^\"]*)\"|'(?<sq>[^']*)'|(?<bare>[^\\s>]+))", RegexOptions.Compiled)]
    private static partial Regex AttributeRegex();

    [GeneratedRegex("\\s+", RegexOptions.Compiled)]
    private static partial Regex WhitespaceRegex();
}
