using MediaService.Web.Models.Hub;
using Microsoft.AspNetCore.SignalR;

namespace MediaService.Web.Hubs;

public class CallHub : Hub
{
    public async Task CallUser(CallUserRequest userRequest)
    {
        string? targetConnectionId = CallConnectionRegistry.GetConnectionId(userRequest.TargetUserId);
        if (targetConnectionId != null)
        {
            await Clients.Client(targetConnectionId).SendAsync("IncomingCall", new
            {
                FromUserId = Context.UserIdentifier,
                FromUsername = userRequest.FromUsername,
                FromAvatarUrl = userRequest.FromAvatarUrl,
                ChannelId = userRequest.ChannelId
            });
        }
        else
        {
            Console.WriteLine($"⚠️ Пользователь {userRequest.TargetUserId} не в сети");
        }
    }

    public async Task AcceptCall(string callerId, string channelId)
    {
        string receiverId = Context.UserIdentifier!;


        // Добавить подключение в группу вызова
        string? callerConnection = CallConnectionRegistry.GetConnectionId(callerId);
        if (callerConnection is null)
        {
            Console.WriteLine("callerConnection не найден");
            return;
        }

        Console.WriteLine($"✅ Пользователь {receiverId} принял звонок от пользователя {callerId} (канал: {channelId})");

        await Clients.Client(callerConnection).SendAsync("CallAccepted", receiverId, channelId);
    }

    public async Task RejectCall(string callerId)
    {
        string? callerConnection = CallConnectionRegistry.GetConnectionId(callerId);
        if (callerConnection is null)
        {
            Console.WriteLine("callerConnection не найден");
            return;
        }

        await Clients.Client(callerConnection).SendAsync("CallRejected");
    }

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
    
    public async Task SendOffer(SendOfferRequest request)
    {
        string connectionId = CallConnectionRegistry.GetConnectionId(request.ToUserId)!;
        await Task.Delay(TimeSpan.FromSeconds(5));
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