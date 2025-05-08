using ChatChannelService.Application.Features.ChannelFeatures.Commands;
using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Features.ChannelFeatures.Queries;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Channels.Requests;
using ChatChannelService.Web.Models.Channels.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Vibic.Shared.Core.Controllers;

namespace ChatChannelService.Web.Controllers.Channels;

[Route("/channels")]
public class ChannelsController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpGet("direct/{id}")]
    public async Task<IActionResult> GetDirectChannelById(Guid id)
    {
        GetDirectChannelQuery query = new(id);
        
        DirectChannelDto directChannel = await mediator.Send(query);

        DirectChannelResponse response = directChannel.MapToDirectMessageResponse();
        
        return Ok(response);
    }
    
    [HttpGet("direct")]
    [ProducesResponseType(typeof(List<DirectChannelResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyDirectChannels()
    {
        GetMyDirectMessageQuery query = new();

        List<DirectChannelDto> directMessages = await mediator.Send(query);

        List<DirectChannelResponse> responses = directMessages
            .ConvertAll(x => x.MapToDirectMessageResponse());

        return Ok(responses);
    }

    [HttpPost("direct")]
    [ProducesResponseType(typeof(DirectChannelResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateDirectChannel(CreateDirectChannelRequest request)
    {
        CreateDirectChannelCommand command = new(request.UserId);

        DirectChannelDto? directChannelDto = await mediator.Send(command);

        if (directChannelDto is null)
        {
            return NoContent();
        }

        DirectChannelResponse response = directChannelDto.MapToDirectMessageResponse();

        return Created(string.Empty, response);
    }
}