using ChatChannelService.Application.Features.ServersFeatures;
using ChatChannelService.Application.Features.ServersFeatures.Commands;
using ChatChannelService.Application.Features.ServersFeatures.Queries;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Servers.Requests;
using ChatChannelService.Web.Models.Servers.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Vibic.Shared.Core.Controllers;

namespace ChatChannelService.Web.Controllers;

[Route("/servers")]
public class ServersController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpGet("mine")]
    [ProducesResponseType(typeof(List<ServerResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllMyServers()
    {
        GetAllMyServersQuery query = new();
        List<ServerDto> servers = await mediator.Send(query);

        List<ServerResponse> responses = servers.ConvertAll(s => s.MapToResponse());

        return Ok(responses);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ServerResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateServer(ServerRequest request)
    {
        CreateServerCommand command = new(request.Name);

        ServerDto server = await mediator.Send(command);
        
        ServerResponse response = server.MapToResponse();

        return Created(string.Empty, response);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteServer(Guid id)
    {
        DeleteServerCommand command = new(id);

        await mediator.Send(command);

        return NoContent();
    }
}