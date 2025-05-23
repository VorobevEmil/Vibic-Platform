using Vibic.Shared.EF.Entities;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Core.Entities;

public class ChatUser : BaseEntity, IUpdatable, ISoftDeletable
{
    private ChatUser()
    {
    }

    public ChatUser(Guid id, string displayName, string username, string avatarUrl)
    {
        Id = id;
        DisplayName = displayName;
        Username = username;
        AvatarUrl = avatarUrl;
    }

    public string DisplayName { get; private set; } = string.Empty;
    public string Username { get; private set; } = string.Empty;
    public string AvatarUrl { get; private set; } = string.Empty;
    public List<ServerMember> ServerMembers { get; private init; } = new();
    public List<ChannelMember> ChannelMembers { get; private init; } = new();
    public List<Message> Messages { get; private init; } = new();
    public DateTime? UpdatedAt { get; private init; }
    public bool IsDeleted { get; private init; }
    public DateTime? DeletedAt { get; private init; }

    public void UpdateAvatarUrl(string avatarUrl)
    {
        AvatarUrl = avatarUrl;
    }
}