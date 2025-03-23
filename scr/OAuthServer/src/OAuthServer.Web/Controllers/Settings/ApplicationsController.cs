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

    [HttpPost]
    public async Task<IActionResult> CreateApplication(ApplicationDto dto)
    {
        ApplicationResponse response = await _openIdApplicationService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetApplicationById), new { id = response.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateApplication(string id, [FromBody] ApplicationDto dto)
    {
        await _openIdApplicationService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteApplication(string id)
    {
        await _openIdApplicationService.DeleteAsync(id);
        return NoContent();
    }
}