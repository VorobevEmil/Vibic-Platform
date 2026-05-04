using NotificationService.Core.Enums;

namespace NotificationService.Application.Features.NotificationFeatures.Common;

public record NotificationDto(
    Guid Id,
    NotificationType Type,
    string Title,
    string? Content,
    Guid? RelatedEntityId,
    bool IsRead,
    DateTime CreatedAt);
