using NotificationService.Application.Features.NotificationFeatures.Common;

namespace NotificationService.Application.Services;

public interface INotificationPushService
{
    Task PushAsync(Guid userId, NotificationDto notification, CancellationToken cancellationToken = default);
    Task PushReadAsync(Guid userId, IReadOnlyList<Guid>? notificationIds, CancellationToken cancellationToken = default);
}
