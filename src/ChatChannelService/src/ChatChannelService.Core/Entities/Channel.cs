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

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return;
        }

        Name = name.Trim();
    }

    public void SetVisibility(bool isPublic)
    {
        IsPublic = isPublic;
    }

    public void EnsureMember(ChatUser chatUser)
    {
        if (ChannelMembers.Any(member => member.ChatUserId == chatUser.Id))
        {
            return;
        }

        ChannelMembers.Add(new ChannelMember(this, chatUser));
    }

    public void SyncMembers(IEnumerable<ChatUser> chatUsers)
    {
        HashSet<Guid> targetUserIds = chatUsers
            .Select(chatUser => chatUser.Id)
            .ToHashSet();

        ChannelMembers.RemoveAll(member => !targetUserIds.Contains(member.ChatUserId));

        foreach (ChatUser chatUser in chatUsers)
        {
            EnsureMember(chatUser);
        }
    }
}
