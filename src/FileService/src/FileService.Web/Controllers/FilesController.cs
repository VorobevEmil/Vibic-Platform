using FileService.Application.Features.FileFeatures;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FileService.Web.Controllers;

[Route("files")]
[ApiController]
public class FilesController(IMediator mediator) : ControllerBase
{
    [HttpGet("avatars/{userId}/{fileName}")]
    public async Task<IActionResult> GetAvatar(Guid userId, string fileName)
    {
        GetFileQuery query = new(userId, fileName, "avatars");

        Stream stream = await mediator.Send(query);
        
        return File(stream, "image/jpeg");
    }

    [HttpPost("avatars/{userId}")]
    public async Task<IActionResult> UploadAvatar(Guid userId, [FromForm] IFormFile file)
    {
        UploadFileCommand command = new(userId, "avatars", file);
        string url = await mediator.Send(command);

        return Created(string.Empty, url);
    }
}