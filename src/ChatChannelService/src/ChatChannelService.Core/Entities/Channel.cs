using ChatChannelService.Core.Enums;
using Vibic.Shared.Core.Entities;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Core.Entities;

public class Channel : BaseEntity, IUpdatable
{
    private Channel() { }

    public Channel(string name, ChannelType type, Guid serverId)
    {
        Name = name;
        Type = type;
        ServerId = serverId;
    }
    
    public string Name { get; private set; } = string.Empty;
    public ChannelType Type { get; private set; }
    public Guid? ServerId { get; private set; }
    public Server? Server { get; private set; }

    public List<ChannelMember> ChannelMembers { get; init; } = new();
    public List<Message> Messages { get; init; } = new();
    public DateTime? UpdatedAt { get; init; }
}