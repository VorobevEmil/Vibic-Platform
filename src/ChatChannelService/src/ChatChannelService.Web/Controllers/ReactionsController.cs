using ChatChannelService.Application.Features.MessageFeatures.Commands;
using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Features.MessageFeatures.Queries;
using ChatChannelService.Web.Hubs;
using ChatChannelService.Web.Mappings;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Vibic.Shared.Core.Controllers;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Web.Controllers;

[Route("messages")]
public class ReactionsController(
    IMediator mediator,
    IHubContext<ChatHub> hubContext) : AuthenticateControllerBase
{
    [HttpPost("{messageId}/reactions")]
    public async Task<IActionResult> AddReaction(Guid messageId, [FromBody] AddReactionRequest request)
    {
        AddReactionCommand command = new(messageId, User.GetUserId(), request.Emoji);
        ReactionDto reaction = await mediator.Send(command);

        MessageDto? messageDto = await mediator.Send(new GetMessageByIdQuery(messageId));
        if (messageDto != null)
        {
            var response = messageDto.MapToResponse();
            await hubContext.Clients.Group($"chat:{messageDto.ChannelId}")
                .SendAsync("MessageReactionUpdated", response);
        }

        return Ok(reaction);
    }

    [HttpDelete("{messageId}/reactions")]
    public async Task<IActionResult> RemoveReaction(Guid messageId, [FromQuery] string emoji)
    {
        RemoveReactionCommand command = new(messageId, User.GetUserId(), emoji);
        await mediator.Send(command);

        MessageDto? messageDto = await mediator.Send(new GetMessageByIdQuery(messageId));
        if (messageDto != null)
        {
            var response = messageDto.MapToResponse();
            await hubContext.Clients.Group($"chat:{messageDto.ChannelId}")
                .SendAsync("MessageReactionUpdated", response);
        }

        return NoContent();
    }
}

public record AddReactionRequest(string Emoji);
