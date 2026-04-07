using ChatChannelService.Application.Common.Pagination;
using ChatChannelService.Application.Features.MessageFeatures.Commands;
using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Features.MessageFeatures.Queries;
using ChatChannelService.Core.Enums;
using ChatChannelService.Web.Hubs;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Messages.Requests;
using ChatChannelService.Web.Models.Messages.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Vibic.Shared.Core.Controllers;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Web.Controllers.Channels;

[Route("/servers/{serverId}/channels/{channelId}/messages")]
public class ServerMessagesController(IMediator mediator, IHubContext<ChatHub> hubContext) : AuthenticateControllerBase
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

    [HttpDelete("{messageId:guid}")]
    public async Task<IActionResult> DeleteMessage(
        Guid serverId,
        Guid channelId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        Guid userId = User.GetUserId();

        DeleteMessageCommand command = new(ChannelType.Server, channelId, serverId, messageId, userId);
        await mediator.Send(command, cancellationToken);

        await hubContext.Clients.Group($"chat:{channelId}")
            .SendAsync("MessageDeleted", new { MessageId = messageId, ChannelId = channelId }, cancellationToken);

        return NoContent();
    }

    [HttpPatch("{messageId:guid}")]
    public async Task<IActionResult> EditMessage(
        Guid serverId,
        Guid channelId,
        Guid messageId,
        [FromBody] EditMessageRequest request,
        CancellationToken cancellationToken = default)
    {
        Guid userId = User.GetUserId();

        EditMessageCommand command = new(ChannelType.Server, channelId, serverId, messageId, userId, request.Content);
        MessageDto messageDto = await mediator.Send(command, cancellationToken);

        MessageResponse response = messageDto.MapToResponse();

        await hubContext.Clients.Group($"chat:{channelId}")
            .SendAsync("MessageEdited", response, cancellationToken);

        return Ok(response);
    }
}