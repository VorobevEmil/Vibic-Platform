namespace MediaService.Web.Models.Hub;

public record CallUserRequest(
    string PeerUserId, 
    string PeerUsername,
    string PeerAvatarUrl, 
    string InitiatorUsername, 
    string InitiatorAvatarUrl, 
    string ChannelId);