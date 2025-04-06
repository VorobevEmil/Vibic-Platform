namespace MediaService.Application.DTOs;

public class ParticipantRequest
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public bool IsMuted { get; set; }
}