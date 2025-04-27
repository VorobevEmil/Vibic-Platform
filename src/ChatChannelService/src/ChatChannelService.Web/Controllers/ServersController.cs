using ChatChannelService.Application.Features.ServerFeatures;
using ChatChannelService.Application.Features.ServerFeatures.Commands;
using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Application.Features.ServerFeatures.Queries;
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
    [ProducesResponseType(typeof(List<ServerSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllMyServers()
    {
        GetAllMyServersQuery query = new();
        List<ServerSummaryDto> servers = await mediator.Send(query);

        List<ServerSummaryResponse> responses = servers.ConvertAll(s => s.MapToResponse());

        return Ok(responses);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ServerFullResponse), StatusCodes.Status201Created)]

    public async Task<IActionResult> GetServerById(Guid id)
    {
        GetServerQuery query = new(id);

        ServerFullDto serverFull = await mediator.Send(query);

        ServerFullResponse response = serverFull.MapToResponse();

        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ServerSummaryResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateServer(ServerRequest request)
    {
        CreateServerCommand command = new(request.Name);

        ServerSummaryDto serverSummary = await mediator.Send(command);

        ServerSummaryResponse summaryResponse = serverSummary.MapToResponse();

        return Created(string.Empty, summaryResponse);
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