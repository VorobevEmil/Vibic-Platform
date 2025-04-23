using Vibic.Shared.Core.Entities;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Core.Entities;

public class Server : BaseEntity, IUpdatable, ISoftDeletable
{
    public Server(string name, ChatUser owner)
    {
        Name = name;
        Owner = owner;
        OwnerId = owner.Id;
    }
    
    private Server() { }
    
    public string? IconUrl { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid OwnerId { get; init; }
    public ChatUser Owner { get; init; }
    public List<Channel> Channels { get; init; } = new();
    public List<ServerMember> ServerMembers { get; init; } = new();
    public List<ServerRole> ServerRoles { get; init; } = new();
    public DateTime? UpdatedAt { get; init; }
    public bool IsDeleted { get; init; }
    public DateTime? DeletedAt { get; init; }
}