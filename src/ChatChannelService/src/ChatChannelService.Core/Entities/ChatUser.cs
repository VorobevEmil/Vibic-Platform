using Vibic.Shared.Core.Entities;
using Vibic.Shared.Core.Interfaces;

namespace ChatChannelService.Core.Entities;

public class ChatUser : BaseEntity, IUpdatable, ISoftDeletable
{
    private ChatUser()
    {
    }

    public ChatUser(Guid id, string username)
    {
        Id = id;
        Username = username;
    }

    public string Username { get; private set; } = string.Empty;
    public List<ServerMember> ServerMembers { get; private init; } = new();
    public List<ChannelMember> ChannelMembers { get; private init; } = new();
    public List<Message> Messages { get; private init; } = new();
    public DateTime? UpdatedAt { get; private init; }
    public bool IsDeleted { get; private init; }
    public DateTime? DeletedAt { get; private init; }
}