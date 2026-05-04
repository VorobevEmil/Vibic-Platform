using Microsoft.AspNetCore.SignalR;
using NotificationService.Application.Features.NotificationFeatures.Common;
using NotificationService.Application.Services;
using NotificationService.Web.Hubs;

namespace NotificationService.Web.Services;

public class SignalRNotificationPushService(IHubContext<NotificationHub> hubContext) : INotificationPushService
{
    public Task PushAsync(Guid userId, NotificationDto notification, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients
            .Group($"user:{userId}")
            .SendAsync("ReceiveNotification", notification, cancellationToken);
    }

    public Task PushReadAsync(Guid userId, IReadOnlyList<Guid>? notificationIds, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients
            .Group($"user:{userId}")
            .SendAsync("NotificationsRead", notificationIds, cancellationToken);
    }
}
