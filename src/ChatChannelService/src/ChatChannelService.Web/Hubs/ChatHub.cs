using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ChatChannelService.Web.Hubs;

[Authorize]
public class ChatHub : Hub
{
    // Пользователь присоединяется к определённому каналу
    public async Task JoinChannel(string channelId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, channelId);
        Console.WriteLine($"✅ {Context.UserIdentifier} joined channel {channelId}");
    }

    // Пользователь покидает канал (необязательно)
    public async Task LeaveChannel(string channelId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, channelId);
        Console.WriteLine($"🚪 {Context.UserIdentifier} left channel {channelId}");
    }

    // Отправка сообщения в канал
    public async Task SendMessageToChannel(SendMessageRequest request)
    {
        var senderId = Context.UserIdentifier;

        // Здесь можно сохранить сообщение в БД (если нужно)
        var message = new
        {
            id = Guid.NewGuid(),
            channelId = request.ChannelId,
            content = request.Content,
            senderId = senderId,
            senderUsername = request.SenderUsername,
            senderAvatarUrl = request.SenderAvatarUrl,
            sentAt = DateTime.UtcNow
        };

        // Отправка всем участникам группы (канала)
        await Clients.Group(request.ChannelId).SendAsync("ReceiveMessage", message);
    }

    public override Task OnConnectedAsync()
    {
        Console.WriteLine($"🔌 Connected: {Context.ConnectionId}");
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"❌ Disconnected: {Context.ConnectionId}");
        return base.OnDisconnectedAsync(exception);
    }
}

public class SendMessageRequest
{
    public string ChannelId { get; set; } = default!;
    public string SenderId { get; set; } = default!;
    public string Content { get; set; } = default!;

    // для отображения в UI
    public string SenderUsername { get; set; } = default!;
    public string? SenderAvatarUrl { get; set; }
}