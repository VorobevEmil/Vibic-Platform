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
        string uniqueFileName = await mediator.Send(command);

        return Created(string.Empty, uniqueFileName);
    }

    [HttpGet("servers/{serverId}/{fileName}")]
    public async Task<IActionResult> GetServerIcon(Guid serverId, string fileName)
    {
        GetFileQuery query = new(serverId, fileName, "servers");

        Stream stream = await mediator.Send(query);

        return File(stream, "image/jpeg");
    }

    [HttpPost("servers/{serverId}")]
    public async Task<IActionResult> UploadServerIcon(Guid serverId, [FromForm] IFormFile file)
    {
        UploadFileCommand command = new(serverId, "servers", file);
        string uniqueFileName = await mediator.Send(command);

        return Created(string.Empty, uniqueFileName);
    }

    [HttpPost("attachments")]
    public async Task<IActionResult> UploadAttachment([FromForm] IFormFile file)
    {
        UploadAttachmentCommand command = new(file);
        string url = await mediator.Send(command);

        return Created(string.Empty, url);
    }

    [HttpGet("attachments/{fileId}/{fileName}")]
    public async Task<IActionResult> GetAttachment(Guid fileId, string fileName)
    {
        GetFileQuery query = new(fileId, fileName, "attachments");
        Stream stream = await mediator.Send(query);

        string contentType = Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".png"  => "image/png",
            ".gif"  => "image/gif",
            ".webp" => "image/webp",
            ".svg"  => "image/svg+xml",
            _       => "image/jpeg",
        };

        return File(stream, contentType);
    }
}
