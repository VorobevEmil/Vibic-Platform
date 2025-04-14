using ChatChannelService.Application.Features.Servers;
using ChatChannelService.Application.Features.Servers.Commands;
using ChatChannelService.Application.Features.Servers.Queries;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Servers.Requests;
using ChatChannelService.Web.Models.Servers.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ChatChannelService.Web.Controllers;

[ApiController]
[Route("/servers")]
public class ServersController(IMediator mediator) : ControllerBase
{
    
    [HttpGet]
    public async Task<IActionResult> GetAllMyServers()
    {
        GetAllMyServersQuery query = new();
        List<ServerDto> servers = await mediator.Send(query);

        List<ServerResponse> responses = servers.ConvertAll(s => s.MapToResponse());

        return Ok(responses);
    }

    [HttpPost]
    public async Task<IActionResult> CreateServer(ServerRequest request)
    {
        CreateServerCommand command = new(request.Name);

        ServerDto server = await mediator.Send(command);

        return Created(string.Empty, server.MapToResponse());
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServer(Guid id)
    {
        DeleteServerCommand command = new(id);
        
        await mediator.Send(command);
        
        return NoContent();
    }
}