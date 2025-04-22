using ChatChannelService.Application.Features.MessageFeatures.Commands;
using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Messages.Responses;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Web.Hubs;

[Authorize]
public class ChatHub(IMediator mediator) : Hub
{
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
    
    // Пользователь присоединяется к определённому каналу
    public async Task JoinChannel(string channelId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat:{channelId}");
        Console.WriteLine($"✅ {Context.UserIdentifier} joined channel {channelId}");
    }

    // Пользователь покидает канал (необязательно)
    public async Task LeaveChannel(string channelId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat:{channelId}");
        Console.WriteLine($"🚪 {Context.UserIdentifier} left channel {channelId}");
    }

    // Отправка сообщения в канал
    public async Task SendMessageToChannel(SendMessageRequest request)
    {
        Guid channelId = Guid.Parse(request.ChannelId);
        Guid userId = Context.User!.GetUserId();

        CreateMessageCommand command = new(channelId, userId, request.Content);
        
        MessageDto message = await mediator.Send(command);
        
        MessageResponse response = message.MapToResponse();

        // Отправка всем участникам группы (канала)
        await Clients.Group($"chat:{request.ChannelId}").SendAsync("ReceiveMessage", response);
    }

    public async Task SendTypingStatus(string channelId, string username)
    {
        await Clients.Group($"chat:{channelId}").SendAsync("UserTyping", channelId, username);
    }
}

public class SendMessageRequest
{
    public string ChannelId { get; set; } = null!;
    public string Content { get; set; } = null!;
}