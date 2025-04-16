using ChatChannelService.Core.Enums;
using Vibic.Shared.Core.Entities;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Core.Entities;

public class Channel : BaseEntity, IUpdatable
{
    private Channel()
    {
    }

    public static Channel CreateDirectMessageChannel()
    {
        return new Channel
        {
            Type = ChannelType.DirectMessage
        };
    }

    public static Channel CreateTextChannel(string name,  Guid serverId)
    {
        return new Channel
        {
            Name = name,
            Type = ChannelType.Text,
            ServerId = serverId
        };
    }

    public string? Name { get; private set; }
    public ChannelType Type { get; private init; }
    public Guid? ServerId { get; private init; }
    public Server? Server { get; private init; }

    public List<ChannelMember> ChannelMembers { get; private init; } = new();
    public List<Message> Messages { get; private init; } = new();
    public DateTime? UpdatedAt { get; private init; }
}