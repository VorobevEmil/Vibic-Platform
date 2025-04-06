using MediaService.Application.DTOs;

namespace MediaService.Application.Interfaces;

public interface IVoiceService
{
    // Создать звонок (в контексте VoiceChannel)
    Task<VoiceSessionRequest> CreateSessionAsync(Guid channelId, Guid creatorId);

    // Подключиться к звонку
    Task<bool> JoinSessionAsync(Guid sessionId, Guid userId);

    // Покинуть звонок
    Task<bool> LeaveSessionAsync(Guid sessionId, Guid userId);

    // Отправить signaling (SDP, ICE)
    Task SendSignalAsync(Guid sessionId, Guid userId, string signalType, string payload);

    // Список участников
    Task<ICollection<ParticipantRequest>> GetParticipantsAsync(Guid sessionId);
}
