using ChatChannelService.Application.Features.ChannelFeatures;
using ChatChannelService.Application.Features.ChannelFeatures.Commands;
using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Features.ChannelFeatures.Queries;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Channels.Requests;
using ChatChannelService.Web.Models.Channels.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Vibic.Shared.Core.Controllers;

namespace ChatChannelService.Web.Controllers;

[Route("/channels")]
public class ChannelsController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpGet("direct/{id}")]
    public async Task<IActionResult> GetDirectChannelById(Guid id)
    {
        GetDirectChannelQuery query = new(id);
        
        DirectChannelDto directChannel = await mediator.Send(query);

        ChannelDirectChannelResponse response = directChannel.MapToDirectMessageResponse();
        
        return Ok(response);
    }
    
    [HttpGet("direct")]
    [ProducesResponseType(typeof(List<ChannelDirectChannelResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyDirectChannels()
    {
        GetMyDirectMessageQuery query = new();

        List<DirectChannelDto> directMessages = await mediator.Send(query);

        List<ChannelDirectChannelResponse> responses = directMessages
            .ConvertAll(x => x.MapToDirectMessageResponse());

        return Ok(responses);
    }

    [HttpPost("direct")]
    [ProducesResponseType(typeof(ChannelDirectChannelResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateDirectChannel(CreateDirectChannelRequest request)
    {
        CreateDirectMessageCommand command = new(request.UserId);

        DirectChannelDto? channelDirectMessageDto = await mediator.Send(command);

        if (channelDirectMessageDto is null)
        {
            return NoContent();
        }

        ChannelDirectChannelResponse response = channelDirectMessageDto.MapToDirectMessageResponse();

        return Created(string.Empty, response);
    }
}