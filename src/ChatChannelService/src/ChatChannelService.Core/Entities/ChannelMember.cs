namespace ChatChannelService.Core.Entities;

public class ChannelMember
{
    private ChannelMember() { }
    
    public ChannelMember(Channel channel, Guid chatUserId)
    {
        Channel = channel;
        ChatUserId = chatUserId;
    }
    
    public Guid ChannelId { get; private init; }
    public Channel Channel { get; private init; }
    public Guid ChatUserId { get; private init; }
    public ChatUser ChatUser { get; private init; } = null!;
}