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
    public async Task<IActionResult> GetMessages(Guid channelId)
    {
        GetMessagesQuery query = new(channelId);

        List<MessageDto> messages = await mediator.Send(query);

        List<MessageResponse> responses = messages
            .ConvertAll(m => m.MapToResponse());

        return Ok(responses);
    }
}