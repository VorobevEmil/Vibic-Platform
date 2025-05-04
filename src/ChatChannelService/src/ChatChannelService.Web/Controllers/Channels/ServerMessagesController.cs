using ChatChannelService.Application.Common.Pagination;
using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Features.MessageFeatures.Queries;
using ChatChannelService.Core.Enums;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Messages.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Vibic.Shared.Core.Controllers;

namespace ChatChannelService.Web.Controllers.Channels;

[Route("/servers/{serverId}/channels/{channelId}/messages")]
public class ServerMessagesController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetServerChannelMessages(
        Guid serverId,
        Guid channelId,
        string? cursor = null,
        int limit = 20,
        CancellationToken cancellationToken = default)
    {
        GetMessagesQuery query = new(ChannelType.Server, serverId, channelId, cursor, limit);

        CursorPaginatedResult<MessageDto> result = await mediator.Send(query, cancellationToken);

        List<MessageResponse> responses = result.Items.ConvertAll(m => m.MapToResponse());

        CursorPaginatedResult<MessageResponse> responseResult = new(responses, result.Cursor, result.HasMore);

        return Ok(responseResult);
    }
}