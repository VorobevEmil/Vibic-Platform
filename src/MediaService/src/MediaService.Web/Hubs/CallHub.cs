using MediaService.Web.Models.Hub;
using Microsoft.AspNetCore.SignalR;

namespace MediaService.Web.Hubs;

public class CallHub : Hub
{
    public override Task OnConnectedAsync()
    {
        string userId = Context.UserIdentifier!;
        CallConnectionRegistry.Register(userId, Context.ConnectionId);

        return base.OnConnectedAsync();
    }


    //TODO подумать над несколькими окнами
    public override Task OnDisconnectedAsync(Exception? exception)
    {
        string userId = Context.UserIdentifier!;
        CallConnectionRegistry.Remove(userId);

        return base.OnDisconnectedAsync(exception);
    }

    public async Task CallUser(CallUserRequest request)
    {
        string? targetConnectionId = CallConnectionRegistry.GetConnectionId(request.PeerUserId);
        if (targetConnectionId != null)
        {
            await Clients.Client(targetConnectionId).SendAsync("IncomingCall", new
            {
                PeerUserId = Context.UserIdentifier,
                request.PeerUsername,
                request.PeerAvatarUrl,
                request.InitiatorUsername,
                request.InitiatorAvatarUrl,
                request.ChannelId
            });
        }
        else
        {
            Console.WriteLine($"⚠️ Пользователь {request.PeerUserId} не в сети");
        }
    }

    public async Task AcceptCall(string peerUserId, string channelId)
    {
        string receiverId = Context.UserIdentifier!;

        // Добавить подключение в группу вызова
        string? peerUserConnection = CallConnectionRegistry.GetConnectionId(peerUserId);
        if (peerUserConnection is null)
        {
            return;
        }

        Console.WriteLine(
            $"✅ Пользователь {receiverId} принял звонок от пользователя {peerUserId} (канал: {channelId})");

        await Clients.Client(peerUserConnection).SendAsync("CallAccepted", receiverId, channelId);
    }

    public async Task RejectCall(string peerUserId)
    {
        string? peerUserConnection = CallConnectionRegistry.GetConnectionId(peerUserId);
        if (peerUserConnection is null)
        {
            return;
        }

        await Clients.Client(peerUserConnection).SendAsync("CallRejected");
    }

    public async Task CancelCall(string peerUserId, bool isAcceptedCall)
    {
        string method = isAcceptedCall ? "CancelAcceptedCall" : "CancelIncomingCall";

        string? peerUserConnection = CallConnectionRegistry.GetConnectionId(peerUserId);
        if (peerUserConnection is null)
        {
            return;
        }

        await Clients.Client(peerUserConnection).SendAsync(method);
    }

    public async Task NotifyCameraStatusChanged(string toUserId, bool isMicOn)
    {
        string? peerUserConnection = CallConnectionRegistry.GetConnectionId(toUserId);
        if (peerUserConnection is null)
        {
            return;
        }

        await Clients.Client(peerUserConnection).SendAsync("PeerCameraStatusChanged", isMicOn);
    }

    public async Task NotifyMicStatusChanged(string toUserId, bool isMicOn)
    {
        await Clients.User(toUserId).SendAsync("PeerMicStatusChanged", isMicOn);
    }

    public async Task SendOffer(SendOfferRequest request)
    {
        string connectionId = CallConnectionRegistry.GetConnectionId(request.ToUserId)!;
        Console.WriteLine("Оффер получен");
        await Clients.Client(connectionId).SendAsync("ReceiveOffer", Context.UserIdentifier, request.Offer);
    }

    public async Task SendAnswer(SendAnswerRequest request)
    {
        string? connectionId = CallConnectionRegistry.GetConnectionId(request.ToUserId)!;
        Console.WriteLine("Ответ получен");
        await Clients.Client(connectionId).SendAsync("ReceiveAnswer", request.Answer);
    }

    public async Task SendIceCandidate(SendIceCandidateRequest request)
    {
        string? connectionId = CallConnectionRegistry.GetConnectionId(request.ToUserId)!;
        Console.WriteLine("Кандидаты получены");
        await Clients.Client(connectionId).SendAsync("ReceiveIceCandidate", request.Candidate);
    }
}