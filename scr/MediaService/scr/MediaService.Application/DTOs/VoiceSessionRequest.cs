namespace MediaService.Application.DTOs;

public class VoiceSessionRequest
{
    public Guid SessionId { get; set; }
    public Guid ChannelId { get; set; }
    public Guid OwnerId { get; set; }
    public List<ParticipantRequest> Participants { get; set; } = new();
}
