using MediatR;
using UserService.Application.Interfaces;

namespace UserService.Application.Features.UserProfileFeatures.Queries;

public record GetAvatarQuery(Guid UserId, string FileName) : IRequest<Stream>;

public class GetAvatarHandler : IRequestHandler<GetAvatarQuery, Stream>
{
    private readonly IFileStorageClient _fileStorageClient;

    public GetAvatarHandler(IFileStorageClient fileStorageClient)
    {
        _fileStorageClient = fileStorageClient;
    }

    public async Task<Stream> Handle(GetAvatarQuery request, CancellationToken cancellationToken)
    {
        Stream userAvatar = await _fileStorageClient.GetUserAvatarAsync(request.UserId, request.FileName);

        return userAvatar;
    }
}