using Vibic.Shared.EF.Entities;

namespace ChatChannelService.Core.Entities;

public class Invite : BaseEntity
{
    private Invite() { }
    
    public Invite(string code, Server server)
    {
        Code = code;
        Server = server;
        ServerId = server.Id;
    }
    
    public string Code { get; init; } 
    public Guid ServerId { get; init; }
    public Server Server { get; init; }
}