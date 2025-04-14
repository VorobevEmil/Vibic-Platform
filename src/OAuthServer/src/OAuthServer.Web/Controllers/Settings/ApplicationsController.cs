using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Commands;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Common;
using OAuthServer.Application.Features.Settings.ApplicationFeatures.Queries;
using OAuthServer.Web.Mappings;
using OAuthServer.Web.Models.Settings.Applications.Requests;
using OAuthServer.Web.Models.Settings.Applications.Responses;

namespace OAuthServer.Web.Controllers.Settings;

[ApiController]
[Route("api/settings/applications")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ApplicationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllApplications()
    {
        List<ApplicationDto> result = await _mediator.Send(new GetAllApplicationQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetApplicationById(string id)
    {
        ApplicationDto result = await _mediator.Send(new GetApplicationQuery(id));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateApplication(ApplicationRequest request)
    {
        CreateApplicationCommand command = request.MapToCreateCommand();

        ApplicationDto dto = await _mediator.Send(command);
        
        ApplicationResponse response = dto.MapToResponse();

        return CreatedAtAction(nameof(GetApplicationById), new { id = response.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateApplication(string id, ApplicationRequest request)
    {
        UpdateApplicationCommand command = request.MapToUpdateCommand(id);

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteApplication(string id)
    {
        await _mediator.Send(new DeleteApplicationCommand(id));
        return NoContent();
    }
}