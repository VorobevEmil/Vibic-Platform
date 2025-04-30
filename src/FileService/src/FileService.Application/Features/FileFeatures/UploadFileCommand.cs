using FileService.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace FileService.Application.Features.FileFeatures;

public record UploadFileCommand(Guid UserId, string Bucket, IFormFile File) : IRequest<string>;

public class UploadFileCommandHandler : IRequestHandler<UploadFileCommand, string>
{
    private readonly IFileStorageService _fileStorage;

    public UploadFileCommandHandler(IFileStorageService fileStorage)
    {
        _fileStorage = fileStorage;
    }

    public async Task<string> Handle(UploadFileCommand request, CancellationToken cancellationToken)
    {
        string bucket = request.Bucket;
        await using Stream stream = request.File.OpenReadStream();
        string fileName = request.File.FileName;
        string contentType = request.File.ContentType;
        Guid userId = request.UserId;
        await _fileStorage.DeleteFolderAsync(bucket, userId.ToString());
        string uniqueFileName = await _fileStorage.UploadAsync(stream, userId, fileName, contentType, bucket);
        return uniqueFileName;
    }
}