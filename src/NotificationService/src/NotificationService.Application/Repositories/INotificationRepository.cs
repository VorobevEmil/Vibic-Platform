using NotificationService.Core.Entities;

namespace NotificationService.Application.Repositories;

public interface INotificationRepository
{
    Task<List<Notification>> GetAllByUserIdAsync(Guid userId, bool? isRead = null, int limit = 50, int offset = 0, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Notification?> GetByIdAsync(Guid userId, Guid id, CancellationToken cancellationToken = default);
    Task CreateAsync(Notification notification, CancellationToken cancellationToken = default);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
}
