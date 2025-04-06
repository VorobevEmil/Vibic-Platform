using MediaService.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace MediaService.Web.Hubs;

public class VoiceHub : Hub
{
    private readonly IVoiceService _voiceService;

    public VoiceHub(IVoiceService voiceService)
    {
        _voiceService = voiceService;
    }

    public async Task JoinVoice(Guid sessionId)
    {
        Guid userId = GetUserId();
        await _voiceService.JoinSessionAsync(sessionId, userId);
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId.ToString());
    }

    public async Task LeaveVoice(Guid sessionId)
    {
        Guid userId = GetUserId();
        await _voiceService.LeaveSessionAsync(sessionId, userId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId.ToString());
    }

    public async Task SendSignal(Guid sessionId, string signalType, string payload)
    {
        Guid userId = GetUserId();
        await _voiceService.SendSignalAsync(sessionId, userId, signalType, payload);
        await Clients.Group(sessionId.ToString())
            .SendAsync("ReceiveSignal", userId, signalType, payload);
    }

    private Guid GetUserId()
    {
        // Берем userId из JWT claims
        return Guid.Parse(Context.User?.FindFirst("sub")?.Value!);
    }
}
