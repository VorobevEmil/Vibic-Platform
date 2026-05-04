using NotificationService.Application.Features.NotificationFeatures.Common;
using NotificationService.Core.Entities;

namespace NotificationService.Application.Features.NotificationFeatures;

public static class NotificationMappingExtensions
{
    public static NotificationDto MapToDto(this Notification notification)
    {
        return new NotificationDto(
            notification.Id,
            notification.Type,
            notification.Title,
            notification.Content,
            notification.RelatedEntityId,
            notification.IsRead,
            notification.CreatedAt);
    }
}
