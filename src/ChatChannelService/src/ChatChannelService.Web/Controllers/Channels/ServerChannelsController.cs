using ChatChannelService.Application.Features.ChannelFeatures.Commands;
using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Features.ChannelFeatures.Queries;
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
    [HttpGet("{channelId}/members")]
    public async Task<IActionResult> GetChannelMembers(Guid serverId, Guid channelId)
    {
        GetServerChannelParticipantsQuery query = new(serverId, channelId);
        List<ServerChannelParticipantDto> participants = await mediator.Send(query);

        return Ok(participants.ConvertAll(participant => participant.MapToResponse()));
    }

    [HttpPost]
    public async Task<IActionResult> CreateChannel(Guid serverId, CreateServerChannelRequest request)
    {
        CreateServerChannelCommand command = new(serverId, request.Name, request.ChannelType, request.IsPublic);
        ServerChannelDto channel = await mediator.Send(command);

        ServerChannelResponse response = channel.MapToServerChannelResponse();

        return Created(string.Empty, response);
    }
}
