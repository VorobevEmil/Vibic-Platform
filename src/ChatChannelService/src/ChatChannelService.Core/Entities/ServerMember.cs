using Vibic.Shared.EF.Entities;

namespace ChatChannelService.Core.Entities;

public class ServerMember : BaseEntity
{
    public ServerMember(ChatUser chatUser, Server server)
    {
        ChatUser = chatUser;
        Server = server;
        ChatUserId = chatUser.Id;
        ServerId = server.Id;
        DisplayName = chatUser.DisplayName;
    }
    
    private ServerMember() { }
    
    public ChatUser ChatUser { get; init; } = null!;
    public Guid ChatUserId { get; init; }
    public Guid ServerId { get; init; }
    public Server Server { get; init; } = null!;
    public string DisplayName { get; private set; } = string.Empty;
    public List<ServerRole> ServerRoles { get; init; } = new();
}