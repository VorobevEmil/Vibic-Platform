namespace ChatChannelService.Application.Interfaces;

public interface IFileStorageClient
{
    Task<string> UploadServerIconAsync(Guid serverId, Stream fileStream, string fileName);
}
