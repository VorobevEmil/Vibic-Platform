using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using UserService.Application.Features.UserProfileFeatures.Commands;
using UserService.Core.Enums;
using Vibic.Shared.Core.Extensions;

namespace UserService.Web.Hubs;

[Authorize]
public class PresenceHub : Hub
{
    private readonly IMediator _mediator;
    private static readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, byte>> ConnectedUsers = new();

    public PresenceHub(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override async Task OnConnectedAsync()
    {
        Guid userId = Context.User!.GetUserId();
        ConcurrentDictionary<string, byte> connections = ConnectedUsers
            .GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());

        connections.TryAdd(Context.ConnectionId, 0);

        if (connections.Count == 1)
        {
            UpdateUserStatusCommand command = new(UserStatus.Online);
            await _mediator.Send(command);
            await Clients.All.SendAsync("UserStatusChanged", userId, (int)UserStatus.Online);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Guid userId = Context.User!.GetUserId();

        if (ConnectedUsers.TryGetValue(userId, out ConcurrentDictionary<string, byte>? connections))
        {
            connections.TryRemove(Context.ConnectionId, out _);

            if (connections.IsEmpty)
            {
                ConnectedUsers.TryRemove(userId, out _);

                UpdateUserStatusCommand command = new(UserStatus.Offline);
                await _mediator.Send(command);
                await Clients.All.SendAsync("UserStatusChanged", userId, (int)UserStatus.Offline);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task UpdateStatus(int userStatus)
    {
        if (!Enum.IsDefined(typeof(UserStatus), userStatus))
        {
            throw new HubException("Unsupported user status.");
        }

        Guid userId = Context.User!.GetUserId();
        UserStatus nextStatus = (UserStatus)userStatus;

        UpdateUserStatusCommand command = new(nextStatus);
        await _mediator.Send(command);
        await Clients.All.SendAsync("UserStatusChanged", userId, userStatus);
    }
}
