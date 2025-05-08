using ChatChannelService.Application.Features.InviteFeatures.Commands;
using ChatChannelService.Application.Features.InviteFeatures.Common;
using ChatChannelService.Application.Features.InviteFeatures.Queries;
using ChatChannelService.Web.Mappings;
using ChatChannelService.Web.Models.Invites.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Vibic.Shared.Core.Controllers;

namespace ChatChannelService.Web.Controllers;

[Route("invites")]
public class InvitesController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpGet("{inviteCode}")]
    public async Task<IActionResult> GetInvite(string inviteCode)
    {
        GetServerInfoByInviteQuery query = new(inviteCode);

        InviteInfoSummaryDto dto = await mediator.Send(query);

        InviteInfoSummaryResponse response = dto.MapToResponse();

        return Ok(response);
    }

    [HttpPost("{inviteCode}")]
    public async Task<IActionResult> JoinServer(string inviteCode)
    {
        JoinServerCommand command = new(inviteCode);

        JoinServerDto dto = await mediator.Send(command);
        JoinServerResponse response = dto.MapToResponse();

        return Ok(response);
    }
}