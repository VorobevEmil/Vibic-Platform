using Vibic.Shared.Core.Entities;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Core.Entities;

public class Server : BaseEntity, IUpdatable, ISoftDeletable
{
    public Server(string name, Guid ownerId)
    {
        Name = name;
        OwnerId = ownerId;
    }
    
    private Server() { }
    
    public string Name { get; private set; } = string.Empty;
    public Guid OwnerId { get; init; }
    public List<Channel> Channels { get; init; } = new();
    public List<ServerMember> ServerMembers { get; init; } = new();
    public List<ServerRole> ServerRoles { get; init; } = new();
    public DateTime? UpdatedAt { get; init; }
    public bool IsDeleted { get; init; }
    public DateTime? DeletedAt { get; init; }
}