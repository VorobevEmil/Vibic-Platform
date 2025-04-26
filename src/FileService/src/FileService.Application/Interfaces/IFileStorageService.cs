namespace FileService.Application.Interfaces;

public interface IFileStorageService
{
    Task<Stream> GetAsync(Guid userId, string fileName, string bucket);
    Task<string> UploadAsync(Stream fileStream, Guid userId, string fileName, string contentType, string bucketName);
    Task DeleteFolderAsync(string bucketName, string folderPrefix);
    Task DeleteAsync(string fileName, string bucketName);
    Task<bool> ExistsAsync(string fileName, string bucketName);
}
