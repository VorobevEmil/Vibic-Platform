using Vibic.Shared.Core.Entities;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Core.Entities;

public class Message : BaseEntity, IUpdatable, ISoftDeletable
{
    private Message() { }

    public Message(Guid channelId, Guid senderId, string content)
    {
        ChannelId = channelId;
        SenderId = senderId;
        Content = content;
    }
    
    public Guid ChannelId { get; init; }
    public Channel Channel { get; init; } = null!;
    public Guid SenderId { get; init; }
    public ChatUser ChatUser { get; init; } = null!;
    public string Content { get; private set; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public bool IsDeleted { get; init; }
    public DateTime? DeletedAt { get; init; }
}