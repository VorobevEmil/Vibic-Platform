using Vibic.Shared.Core.Entities;

namespace ChatChannelService.Core.Entities;

public class ServerMember : BaseEntity
{
    public ServerMember(Guid chatUserId, Guid serverId, string displayName)
    {
        ChatUserId = chatUserId;
        ServerId = serverId;
        DisplayName = displayName;
    }
    
    private ServerMember() { }
    
    public ChatUser ChatUser { get; init; } = null!;
    public Guid ChatUserId { get; init; }
    public Guid ServerId { get; init; }
    public Server Server { get; init; } = null!;
    public string DisplayName { get; private set; } = string.Empty;
    public List<ServerRole> ServerRoles { get; init; } = new();
}