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
    public List<ServerMember> ServerMembers { get; init; } = new();
    public List<ChannelMember> ChannelMembers { get; init; } = new();
    public List<Message> Messages { get; init; } = new();
    public DateTime? UpdatedAt { get; init; }
    public bool IsDeleted { get; init; }
    public DateTime? DeletedAt { get; init; }
}