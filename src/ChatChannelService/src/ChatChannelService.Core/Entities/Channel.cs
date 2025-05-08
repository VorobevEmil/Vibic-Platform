using ChatChannelService.Core.Enums;
using Vibic.Shared.EF.Entities;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Core.Entities;

public class Channel : BaseEntity, IUpdatable
{
    private Channel()
    {
    }

    public static Channel CreateDirectChannel()
    {
        return new Channel
        {
            ChannelType = ChannelType.Direct
        };
    }

    public static Channel CreateServerChannel(string name,  Server server, ChannelType channelType, bool isPublic = true)
    {
        return new Channel
        {
            Name = name,
            ChannelType = channelType,
            Server = server,
            ServerId = server.Id,
            IsPublic = isPublic
        };
    }

    public string? Name { get; private set; }
    public ChannelType ChannelType { get; private init; }
    public Guid? ServerId { get; private init; }
    public Server? Server { get; private init; }
    public bool IsPublic { get; private set; }

    public List<ChannelMember> ChannelMembers { get; private init; } = new();
    public List<Message> Messages { get; private init; } = new();
    public DateTime? UpdatedAt { get; private init; }
}