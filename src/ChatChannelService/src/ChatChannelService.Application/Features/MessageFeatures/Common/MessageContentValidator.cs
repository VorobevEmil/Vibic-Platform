using System.Text.RegularExpressions;

namespace ChatChannelService.Application.Features.MessageFeatures.Common;

public static partial class MessageContentValidator
{
    public static bool HasMeaningfulContent(string? content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return false;
        }

        string withoutReplyPrefix = ReplyPrefixRegex().Replace(content, string.Empty, 1);
        bool hasAttachments = ImageMarkerRegex().IsMatch(withoutReplyPrefix);
        string withoutAttachments = ImageMarkerRegex().Replace(withoutReplyPrefix, string.Empty);

        return hasAttachments || !string.IsNullOrWhiteSpace(withoutAttachments);
    }

    [GeneratedRegex("^%%REPLY\\|([^|]+)\\|([^|]+)\\|([^%]*)%%\\n?", RegexOptions.Compiled)]
    private static partial Regex ReplyPrefixRegex();

    [GeneratedRegex("%%IMG\\|[^%]+%%", RegexOptions.Compiled)]
    private static partial Regex ImageMarkerRegex();
}
