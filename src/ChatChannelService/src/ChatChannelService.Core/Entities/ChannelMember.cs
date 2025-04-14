namespace ChatChannelService.Core.Entities;

public class ChannelMember
{
    public Guid ChannelId { get; private set; }
    public Channel Channel { get; private set; } = null!;
    public Guid UserId { get; private set; }
    public ChatUser User { get; private set; } = null!;
}