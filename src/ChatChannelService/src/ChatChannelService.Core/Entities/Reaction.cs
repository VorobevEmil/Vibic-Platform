using Vibic.Shared.EF.Entities;

namespace ChatChannelService.Core.Entities;

public class Reaction : BaseEntity
{
    private Reaction() { }

    public Reaction(Message message, Guid userId, string emoji)
    {
        Message = message;
        MessageId = message.Id;
        UserId = userId;
        Emoji = emoji;
    }

    public Guid MessageId { get; init; }
    public Message Message { get; init; } = null!;
    public Guid UserId { get; init; }
    public string Emoji { get; private set; }
}
