using FileService.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace FileService.Application.Features.FileFeatures;

public record UploadAttachmentCommand(IFormFile File) : IRequest<string>;

public class UploadAttachmentCommandHandler(IFileStorageService fileStorage)
    : IRequestHandler<UploadAttachmentCommand, string>
{
    public async Task<string> Handle(UploadAttachmentCommand request, CancellationToken cancellationToken)
    {
        const string bucket = "attachments";
        Guid fileId = Guid.NewGuid();

        await using Stream stream = request.File.OpenReadStream();

        // Returns "{fileId}/{randomGuid}{ext}"
        string storedPath = await fileStorage.UploadAsync(
            stream, fileId, request.File.FileName, request.File.ContentType, bucket);

        // storedPath = "fileId/randomName.ext" — extract just the filename after the slash
        string fileName = storedPath.Contains('/') ? storedPath[(storedPath.LastIndexOf('/') + 1)..] : storedPath;

        return $"/files/attachments/{fileId}/{fileName}";
    }
}
