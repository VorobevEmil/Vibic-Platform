using NotificationService.Core.Enums;
using Vibic.Shared.EF.Entities;

namespace NotificationService.Core.Entities;

public class Notification : BaseEntity
{
    private Notification() { }

    public Notification(Guid userId, NotificationType type, string title, string? content = null, Guid? relatedEntityId = null)
    {
        UserId = userId;
        Type = type;
        Title = title;
        Content = content;
        RelatedEntityId = relatedEntityId;
    }

    public Guid UserId { get; init; }
    public NotificationType Type { get; init; }
    public string Title { get; private set; } = string.Empty;
    public string? Content { get; private set; }
    public Guid? RelatedEntityId { get; init; }
    public bool IsRead { get; private set; }
    public DateTime? ReadAt { get; private set; }

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTime.UtcNow;
    }
}
