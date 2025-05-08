using ChatChannelService.Application.Features.ChannelFeatures.Commands;
using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Channels.Requests;
using ChatChannelService.Web.Models.Channels.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Vibic.Shared.Core.Controllers;

namespace ChatChannelService.Web.Controllers.Channels;

[Route("servers/{serverId}/channels")]
public class ServerChannelsController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateChannel(Guid serverId, CreateServerChannelRequest request)
    {
        CreateServerChannelCommand command = new(serverId, request.Name, request.ChannelType, request.IsPublic);
        ServerChannelDto channel = await mediator.Send(command);

        ServerChannelResponse response = channel.MapToServerChannelResponse();

        return Created(string.Empty, response);
    }
}