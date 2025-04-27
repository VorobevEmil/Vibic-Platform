using ChatChannelService.Core.Enums;
using Vibic.Shared.EF.Entities;
using Vibic.Shared.EF.Interfaces;

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

    public static Channel CreateServerChannel(string name,  Server server, bool isPrivate = false)
    {
        return new Channel
        {
            Name = name,
            Type = ChannelType.Server,
            Server = server,
            ServerId = server.Id,
            IsPrivate = isPrivate
        };
    }

    public string? Name { get; private set; }
    public ChannelType Type { get; private init; }
    public Guid? ServerId { get; private init; }
    public Server? Server { get; private init; }
    public bool IsPrivate { get; private set; }

    public List<ChannelMember> ChannelMembers { get; private init; } = new();
    public List<Message> Messages { get; private init; } = new();
    public DateTime? UpdatedAt { get; private init; }
}