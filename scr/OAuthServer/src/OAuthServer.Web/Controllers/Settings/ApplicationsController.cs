using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OAuthServer.Application.DTOs.Settings.Applications;
using OAuthServer.Application.Interfaces.OpenId;

namespace OAuthServer.Web.Controllers.Settings;

[ApiController]
[Route("api/settings/applications")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IOpenIdApplicationService _openIdApplicationService;

    public ApplicationsController(IOpenIdApplicationService openIdApplicationService)
    {
        _openIdApplicationService = openIdApplicationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllApplications()
    {
        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> CreateApplication(ApplicationDto dto)
    {
        string clientId = await _openIdApplicationService.CreateAsync(dto);

        return Created(clientId, null);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveApplication(Guid id)
    {
        return NoContent();
    }
}