using MediatR;
using NotificationService.Application.Features.NotificationFeatures.Common;
using NotificationService.Application.Repositories;

namespace NotificationService.Application.Features.NotificationFeatures.Queries;

public record GetNotificationsQuery(Guid UserId, bool? IsRead = null, int Limit = 50, int Offset = 0) : IRequest<List<NotificationDto>>;

public class GetNotificationsHandler : IRequestHandler<GetNotificationsQuery, List<NotificationDto>>
{
    private readonly INotificationRepository _notificationRepository;

    public GetNotificationsHandler(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<List<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await _notificationRepository.GetAllByUserIdAsync(request.UserId, request.IsRead, request.Limit, request.Offset, cancellationToken);
        return notifications.ConvertAll(n => n.MapToDto());
    }
}
