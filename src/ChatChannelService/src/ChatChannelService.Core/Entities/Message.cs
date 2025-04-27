using Vibic.Shared.EF.Entities;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Core.Entities;

public class Message : BaseEntity, IUpdatable, ISoftDeletable
{
    private Message() { }

    public Message(Channel channel, ChatUser sender, string content)
    {
        Channel = channel;
        Sender = sender;
        Content = content;
    }
    
    public Guid ChannelId { get; init; }
    public Channel Channel { get; init; } = null!;
    public Guid SenderId { get; init; }
    public ChatUser Sender { get; init; } = null!;
    public string Content { get; private set; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public bool IsDeleted { get; init; }
    public DateTime? DeletedAt { get; init; }
}