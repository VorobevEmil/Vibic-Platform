using ChatChannelService.Application.Features.ChannelFeatures;
using ChatChannelService.Application.Features.ChannelFeatures.Queries;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Channels.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Vibic.Shared.Core.Controllers;

namespace ChatChannelService.Web.Controllers;

[ApiController]
[Route("/channels")]
public class ChannelsController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType(typeof(List<List<ChannelDirectMessageResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyDirectMessageChannels()
    {
        GetMyDirectMessageQuery query = new();

        List<ChannelDirectMessageDto> directMessages = await mediator.Send(query);

        List<ChannelDirectMessageResponse> responses = directMessages
            .ConvertAll(x => x.MapToDirectMessageResponse());

        return Ok(responses);
    }
}