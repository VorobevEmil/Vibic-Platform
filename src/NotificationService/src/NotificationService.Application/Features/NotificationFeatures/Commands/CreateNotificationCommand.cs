using MediatR;
using NotificationService.Application.Features.NotificationFeatures.Common;
using NotificationService.Application.Repositories;
using NotificationService.Application.Services;
using NotificationService.Core.Entities;
using NotificationService.Core.Enums;
using Vibic.Shared.EF.Interfaces;

namespace NotificationService.Application.Features.NotificationFeatures.Commands;

public record CreateNotificationCommand(
    Guid UserId,
    NotificationType Type,
    string Title,
    string? Content = null,
    Guid? RelatedEntityId = null) : IRequest<NotificationDto>;

public class CreateNotificationHandler : IRequestHandler<CreateNotificationCommand, NotificationDto>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationPushService _pushService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateNotificationHandler(
        INotificationRepository notificationRepository,
        INotificationPushService pushService,
        IUnitOfWork unitOfWork)
    {
        _notificationRepository = notificationRepository;
        _pushService = pushService;
        _unitOfWork = unitOfWork;
    }

    public async Task<NotificationDto> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        var notification = new Notification(
            request.UserId,
            request.Type,
            request.Title,
            request.Content,
            request.RelatedEntityId);

        await _notificationRepository.CreateAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = notification.MapToDto();
        await _pushService.PushAsync(request.UserId, dto, cancellationToken);

        return dto;
    }
}
