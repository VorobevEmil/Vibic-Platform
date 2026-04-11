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
    [HttpGet("{channelId}/settings")]
    public async Task<IActionResult> GetChannelSettings(Guid serverId, Guid channelId)
    {
        GetServerChannelSettingsQuery query = new(serverId, channelId);
        ServerChannelSettingsDto channel = await mediator.Send(query);

        return Ok(channel.MapToServerChannelSettingsResponse());
    }

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
        CreateServerChannelCommand command = new(serverId, request.Name, request.ChannelType, request.IsPublic, request.MemberIds);
        ServerChannelDto channel = await mediator.Send(command);

        ServerChannelResponse response = channel.MapToServerChannelResponse();

        return Created(string.Empty, response);
    }

    [HttpPut("{channelId}")]
    public async Task<IActionResult> UpdateChannel(
        Guid serverId,
        Guid channelId,
        UpdateServerChannelRequest request)
    {
        UpdateServerChannelCommand command = new(serverId, channelId, request.Name, request.IsPublic, request.MemberIds);
        ServerChannelDto channel = await mediator.Send(command);

        return Ok(channel.MapToServerChannelResponse());
    }

    [HttpDelete("{channelId}")]
    public async Task<IActionResult> DeleteChannel(Guid serverId, Guid channelId)
    {
        DeleteServerChannelCommand command = new(serverId, channelId);
        await mediator.Send(command);

        return NoContent();
    }
}
