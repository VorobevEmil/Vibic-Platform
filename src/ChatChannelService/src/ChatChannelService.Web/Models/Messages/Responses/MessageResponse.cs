namespace ChatChannelService.Web.Models.Messages.Responses;

public class MessageResponse
{
    public required Guid Id { get; init; }
    public required Guid ChannelId { get; init; }
    public required string Content { get; init; }
    public required Guid SenderId { get; init; }
    public required string SenderUsername { get; init; }
    public required string SenderAvatarUrl { get; init; }
    public required DateTime SentAt { get; init; }
}