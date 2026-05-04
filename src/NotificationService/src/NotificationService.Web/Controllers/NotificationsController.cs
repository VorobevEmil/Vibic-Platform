using MediatR;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.Features.NotificationFeatures.Commands;
using NotificationService.Application.Features.NotificationFeatures.Common;
using NotificationService.Application.Features.NotificationFeatures.Queries;
using Vibic.Shared.Core.Controllers;
using Vibic.Shared.Core.Extensions;

namespace NotificationService.Web.Controllers;

[Route("notifications")]
public class NotificationsController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] bool? isRead, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        GetNotificationsQuery query = new(User.GetUserId(), isRead, limit, offset);
        List<NotificationDto> notifications = await mediator.Send(query);
        return Ok(notifications);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        GetUnreadCountQuery query = new(User.GetUserId());
        int count = await mediator.Send(query);
        return Ok(new { count });
    }

    [HttpPost("{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(Guid notificationId)
    {
        MarkAsReadCommand command = new(User.GetUserId(), notificationId);
        await mediator.Send(command);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        MarkAllAsReadCommand command = new(User.GetUserId());
        await mediator.Send(command);
        return NoContent();
    }
}
