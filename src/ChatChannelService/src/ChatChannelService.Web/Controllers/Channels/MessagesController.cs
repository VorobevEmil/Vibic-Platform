using ChatChannelService.Application.Common.Pagination;
using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Features.MessageFeatures.Queries;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Messages.Responses;
using MediatR;
using Vibic.Shared.Core.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace ChatChannelService.Web.Controllers.Channels;

[Route("/channels/{channelId}/messages")]
public class MessagesController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMessages(
        Guid channelId,
        string? cursor = null,
        int limit = 20,
        CancellationToken cancellationToken = default)
    {
        GetMessagesQuery query = new(channelId, cursor, limit);

        CursorPaginatedResult<MessageDto> result = await mediator.Send(query, cancellationToken);

        List<MessageResponse> responses = result.Items
            .ConvertAll(m => m.MapToResponse());

        CursorPaginatedResult<MessageResponse> responseResult = new(responses, result.Cursor, result.HasMore);

        return Ok(responseResult);
    }
}