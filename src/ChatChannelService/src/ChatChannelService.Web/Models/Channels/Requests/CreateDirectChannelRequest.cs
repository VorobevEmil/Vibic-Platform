namespace ChatChannelService.Web.Models.Channels.Requests;

public class CreateDirectChannelRequest
{
    public required Guid UserId { get; set; }
}