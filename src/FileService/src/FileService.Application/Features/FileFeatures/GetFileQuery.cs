using FileService.Application.Interfaces;
using MediatR;

namespace FileService.Application.Features.FileFeatures;

public record GetFileQuery(Guid UserId, string FileName, string Bucket) : IRequest<Stream>;

public class GetFileHandler : IRequestHandler<GetFileQuery, Stream>
{
    private readonly IFileStorageService _fileStorageService;

    public GetFileHandler(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    public async Task<Stream> Handle(GetFileQuery request, CancellationToken cancellationToken)
    {
        return await _fileStorageService.GetAsync(request.UserId, request.FileName, request.Bucket);
    }
}