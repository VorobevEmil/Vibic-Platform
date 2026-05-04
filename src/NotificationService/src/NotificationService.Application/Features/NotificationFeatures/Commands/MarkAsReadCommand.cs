using MediatR;
using NotificationService.Application.Repositories;
using NotificationService.Application.Services;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.EF.Interfaces;

namespace NotificationService.Application.Features.NotificationFeatures.Commands;

public record MarkAsReadCommand(Guid UserId, Guid NotificationId) : IRequest;

public class MarkAsReadHandler : IRequestHandler<MarkAsReadCommand>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationPushService _pushService;

    public MarkAsReadHandler(
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        INotificationPushService pushService)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _pushService = pushService;
    }

    public async Task Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await _notificationRepository.GetByIdAsync(request.UserId, request.NotificationId, cancellationToken);
        if (notification == null)
        {
            throw new NotFoundException("Notification not found");
        }

        notification.MarkAsRead();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _pushService.PushReadAsync(request.UserId, [request.NotificationId], cancellationToken);
    }
}
