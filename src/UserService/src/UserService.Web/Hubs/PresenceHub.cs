using MediatR;
using Microsoft.AspNetCore.SignalR;
using UserService.Application.Features.UserProfileFeatures.Commands;
using UserService.Core.Enums;
using Vibic.Shared.Core.Extensions;

namespace UserService.Web.Hubs;

public class PresenceHub : Hub
{
    private readonly IMediator _mediator;
    private static readonly Dictionary<Guid, List<string>> ConnectedUsers = new();

    public PresenceHub(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override async Task OnConnectedAsync()
    {
        Guid userId = Context.User!.GetUserId();

        if (!ConnectedUsers.ContainsKey(userId))
        {
            ConnectedUsers.Add(userId, new List<string>());
            UpdateUserStatusCommand command = new(UserStatus.Online);
            await _mediator.Publish(command);
        }

        ConnectedUsers[userId].Add(Context.ConnectionId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Guid userId = Context.User!.GetUserId();
        ConnectedUsers[userId].Remove(Context.ConnectionId);

        if (ConnectedUsers[userId].Count == 0)
        {
            ConnectedUsers.Remove(userId);
            UpdateUserStatusCommand command = new(UserStatus.Offline);
            await _mediator.Publish(command);
        }
    }
}