using Vibic.Shared.EF.Entities;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Core.Entities;

public class ServerRole : BaseEntity, IUpdatable, ISoftDeletable
{
    public ServerRole(string name, Guid serverId)
    {
        Name = name;
        ServerId = serverId;
    }
    
    private ServerRole() { }
    
    public Guid ServerId { get; init; }
    public Server Server { get; init; } = null!;
    public string Name { get; private set; } = string.Empty;
    public int Priority { get; private set; } = 0;
    public List<ServerMember> ServerMembers { get; init; } = new();
    public DateTime? UpdatedAt { get; init; }
    public bool IsDeleted { get; init; }
    public DateTime? DeletedAt { get; init; }
}