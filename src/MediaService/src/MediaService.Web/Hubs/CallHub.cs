using MediaService.Web.Models;
using MediaService.Web.Models.Hub;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MediaService.Web.Hubs;

[Authorize]
public class CallHub : Hub
{
    public override Task OnConnectedAsync()
    {
        if (string.IsNullOrWhiteSpace(Context.UserIdentifier))
        {
            Context.Abort();
            return Task.CompletedTask;
        }

        string userId = Context.UserIdentifier!;
        CallConnectionRegistry.Register(userId, Context.ConnectionId);

        return base.OnConnectedAsync();
    }


    //TODO подумать над несколькими окнами
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        string userId = Context.UserIdentifier!;
        CallConnectionRegistry.Remove(userId);

        VoiceChannelManager.RemoveUser(Context.ConnectionId, userId, out string? channelId, out string? serverId, out VoiceUser? user);

        if (channelId != null && user != null)
        {
            await Clients.Group(channelId).SendAsync("UserLeftVoice", user.UserId);
            if (!string.IsNullOrWhiteSpace(serverId))
            {
                await Clients.Group($"server:{serverId}").SendAsync("VoiceChannelUserLeft", channelId, user.UserId);
            }
        }
    }


    public async Task JoinServer(string serverId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"server:{serverId}");
    }

    public async Task LeaveServer(string serverId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"server:{serverId}");
    }

    public Dictionary<string, List<VoiceUser>> GetVoiceUsers(string[] channelIds)
    {
        return VoiceChannelManager.GetUsersForChannels(channelIds);
    }

    public async Task JoinVoiceChannel(string channelId, string serverId, string userId, string displayName, string? avatarUrl = null, bool isMicOn = true)
    {
        string resolvedUserId = !string.IsNullOrWhiteSpace(userId)
            ? userId
            : Context.UserIdentifier ?? string.Empty;

        string resolvedDisplayName = !string.IsNullOrWhiteSpace(displayName)
            ? displayName
            : (Context.User?.Identity?.Name ?? resolvedUserId);

        if (string.IsNullOrWhiteSpace(resolvedUserId) || string.IsNullOrWhiteSpace(resolvedDisplayName))
        {
            Console.WriteLine("❌ JoinVoiceChannel: missing user data");
            Context.Abort();
            return;
        }

        VoiceUser user = new()
        {
            UserId = resolvedUserId,
            DisplayName = resolvedDisplayName,
            AvatarUrl = avatarUrl,
            IsMicOn = isMicOn
        };

        VoiceChannelManager.AddUser(Context.ConnectionId, channelId, serverId, user);
        await Groups.AddToGroupAsync(Context.ConnectionId, channelId);

        // Отправить новому участнику текущих пользователей
        List<VoiceUser> usersInChannel = VoiceChannelManager.GetUsers(channelId);
        await Clients.Caller.SendAsync("VoiceChannelUsers", usersInChannel);

        // Уведомить остальных
        await Clients.OthersInGroup(channelId).SendAsync("UserJoinedVoice", user);
        await Clients.Group($"server:{serverId}").SendAsync("VoiceChannelUserJoined", channelId, user);
    }

    public async Task LeaveVoiceChannel()
    {
        string userId = Context.UserIdentifier!;
        VoiceChannelManager.RemoveUser(Context.ConnectionId, userId, out string? channelId, out string? serverId, out VoiceUser? user);

        if (channelId != null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, channelId);

            if (user != null)
            {
                await Clients.Group(channelId).SendAsync("UserLeftVoice", user.UserId);
                if (!string.IsNullOrWhiteSpace(serverId))
                {
                    await Clients.Group($"server:{serverId}").SendAsync("VoiceChannelUserLeft", channelId, user.UserId);
                }
            }
        }
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
                request.ChannelId,
                request.IsCamOn
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

    public async Task NotifyCameraStatusChanged(string toUserId, bool isCamOn)
    {
        string? peerUserConnection = CallConnectionRegistry.GetConnectionId(toUserId);
        if (peerUserConnection is null)
        {
            return;
        }

        await Clients.Client(peerUserConnection).SendAsync("PeerCameraStatusChanged", isCamOn);
    }

    public async Task NotifyVoiceMicStatusChanged(bool isMicOn)
    {
        string userId = Context.UserIdentifier!;

        bool updated = VoiceChannelManager.UpdateMicStatus(
            Context.ConnectionId, userId, isMicOn,
            out string? channelId, out string? serverId);

        if (!updated || channelId == null) return;

        await Clients.Group(channelId).SendAsync("VoiceUserMicStatusChanged", userId, isMicOn);

        if (!string.IsNullOrWhiteSpace(serverId))
        {
            await Clients.Group($"server:{serverId}").SendAsync("VoiceChannelUserMicStatusChanged", channelId, userId, isMicOn);
        }
    }

    public async Task NotifyMicStatusChanged(string toUserId, bool isMicOn)
    {
        string? connectionId = CallConnectionRegistry.GetConnectionId(toUserId);
        if (connectionId is null) return;

        await Clients.Client(connectionId).SendAsync("PeerMicStatusChanged", isMicOn);
    }

    public async Task SendOffer(SendOfferRequest request)
    {
        string? connectionId = CallConnectionRegistry.GetConnectionId(request.ToUserId);
        if (connectionId is null) return;

        Console.WriteLine("Оффер получен");
        await Clients.Client(connectionId).SendAsync("ReceiveOffer", Context.UserIdentifier, request.Offer);
    }

    public async Task SendAnswer(SendAnswerRequest request)
    {
        string? connectionId = CallConnectionRegistry.GetConnectionId(request.ToUserId);
        if (connectionId is null) return;

        Console.WriteLine("Ответ получен");
        await Clients.Client(connectionId).SendAsync("ReceiveAnswer", Context.UserIdentifier, request.Answer);
    }

    public async Task SendIceCandidate(SendIceCandidateRequest request)
    {
        string? connectionId = CallConnectionRegistry.GetConnectionId(request.ToUserId);
        if (connectionId is null) return;

        Console.WriteLine("Кандидаты получены");
        await Clients.Client(connectionId).SendAsync("ReceiveIceCandidate", Context.UserIdentifier, request.Candidate);
    }
}
