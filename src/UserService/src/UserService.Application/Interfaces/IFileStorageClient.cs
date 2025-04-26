namespace UserService.Application.Interfaces;

public interface IFileStorageClient
{
    Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName);
    Task<Stream> GetUserAvatarAsync(Guid userId, string fileName);
}