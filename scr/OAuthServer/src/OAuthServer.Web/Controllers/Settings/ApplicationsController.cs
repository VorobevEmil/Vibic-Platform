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
        List<ApplicationResponse> result = await _openIdApplicationService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetApplicationById(string id)
    {
        ApplicationResponse result = await _openIdApplicationService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateApplication(string id, [FromBody] ApplicationDto dto)
    {
        dto.Id = id;
        await _openIdApplicationService.UpdateAsync(dto);
        return NoContent();
    }
}