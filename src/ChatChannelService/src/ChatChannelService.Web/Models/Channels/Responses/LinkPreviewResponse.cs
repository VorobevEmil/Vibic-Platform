namespace ChatChannelService.Web.Models.Channels.Responses;

public class LinkPreviewResponse
{
    public required string Url { get; init; }
    public required string FinalUrl { get; init; }
    public required string Kind { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public string? SiteName { get; init; }
    public string? FaviconUrl { get; init; }
    public string? ContentType { get; init; }
}
