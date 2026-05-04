using MediatR;
using NotificationService.Application.Repositories;
using NotificationService.Application.Services;
using Vibic.Shared.EF.Interfaces;

namespace NotificationService.Application.Features.NotificationFeatures.Commands;

public record MarkAllAsReadCommand(Guid UserId) : IRequest;

public class MarkAllAsReadHandler : IRequestHandler<MarkAllAsReadCommand>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationPushService _pushService;

    public MarkAllAsReadHandler(
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        INotificationPushService pushService)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _pushService = pushService;
    }

    public async Task Handle(MarkAllAsReadCommand request, CancellationToken cancellationToken)
    {
        await _notificationRepository.MarkAllAsReadAsync(request.UserId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _pushService.PushReadAsync(request.UserId, null, cancellationToken);
    }
}
