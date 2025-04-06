using System.Collections.Concurrent;
using MediaService.Application.DTOs;
using MediaService.Application.Interfaces;

namespace MediaService.Application.Services;

public class VoiceService : IVoiceService
{
    // Храним сессии звонков в памяти (можно потом заменить на Redis или БД)
    private readonly ConcurrentDictionary<Guid, VoiceSessionRequest> _sessions = new();

    public Task<VoiceSessionRequest> CreateSessionAsync(Guid channelId, Guid creatorId)
    {
        VoiceSessionRequest session = new()
        {
            SessionId = Guid.NewGuid(),
            ChannelId = channelId,
            OwnerId = creatorId,
            Participants =
            [
                new ParticipantRequest
                {
                    UserId = creatorId,
                    Username = "Unknown", // Можно получить из UserService
                    IsMuted = false
                }
            ]
        };

        _sessions.TryAdd(session.SessionId, session);
        return Task.FromResult(session);
    }

    public Task<bool> JoinSessionAsync(Guid sessionId, Guid userId)
    {
        if (!_sessions.TryGetValue(sessionId, out VoiceSessionRequest? session))
            return Task.FromResult(false);

        if (session.Participants.Any(p => p.UserId == userId))
            return Task.FromResult(true);

        session.Participants.Add(new ParticipantRequest
        {
            UserId = userId,
            Username = "Unknown", // Можно запросить из UserService
            IsMuted = false
        });

        return Task.FromResult(true);
    }

    public Task<bool> LeaveSessionAsync(Guid sessionId, Guid userId)
    {
        if (!_sessions.TryGetValue(sessionId, out VoiceSessionRequest? session))
            return Task.FromResult(false);

        ParticipantRequest? participant = session.Participants.FirstOrDefault(p => p.UserId == userId);
        if (participant == null)
            return Task.FromResult(false);

        session.Participants.Remove(participant);

        // Если никого не осталось — удаляем сессию
        if (session.Participants.Count == 0)
        {
            _sessions.TryRemove(sessionId, out _);
        }

        return Task.FromResult(true);
    }

    public Task SendSignalAsync(Guid sessionId, Guid userId, string signalType, string payload)
    {
        // Эта логика сама ничего не делает — это просто заглушка,
        // настоящая отправка signaling пойдет через SignalR Hub
        Console.WriteLine($"[Signal] {signalType} от {userId}: {payload}");
        return Task.CompletedTask;
    }

    public Task<ICollection<ParticipantRequest>> GetParticipantsAsync(Guid sessionId)
    {
        if (_sessions.TryGetValue(sessionId, out VoiceSessionRequest? session))
        {
            return Task.FromResult((ICollection<ParticipantRequest>)session.Participants);
        }

        return Task.FromResult<ICollection<ParticipantRequest>>(Array.Empty<ParticipantRequest>());
    }
}
