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
            Type = ChannelType.Direct
        };
    }

    public static Channel CreateServerChannel(string name,  Server server)
    {
        return new Channel
        {
            Name = name,
            Type = ChannelType.Server,
            Server = server,
            ServerId = server.Id
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