using FileService.Application.Interfaces;
using Minio;
using Minio.ApiEndpoints;
using Minio.DataModel.Args;
using Minio.DataModel.Response;
using Minio.Exceptions;
using Minio.DataModel;

namespace FileService.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;

    public FileStorageService(IMinioClient minioClient)
    {
        _minioClient = minioClient;
    }

    public async Task<Stream> GetAsync(Guid userId, string fileName, string bucket)
    {
        MemoryStream memoryStream = new();

        string objectName = $"{userId}/{fileName}";

        try
        {
            await _minioClient.GetObjectAsync(new GetObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName)
                .WithCallbackStream(stream => stream.CopyTo(memoryStream)));

            memoryStream.Position = 0;
            return memoryStream;
        }
        catch (MinioException ex)
        {
            throw new Exception($"Ошибка получения файла {objectName} из бакета {bucket}: {ex.Message}", ex);
        }
    }

    public async Task<string> UploadAsync(
        Stream fileStream,
        Guid userId,
        string fileName,
        string contentType,
        string bucketName)
    {
        bool found = await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(bucketName));
        if (!found)
        {
            await _minioClient.MakeBucketAsync(new MakeBucketArgs().WithBucket(bucketName));
        }

        string uniqueFileName = GenerateUniqueFileName(userId, fileName);

        PutObjectResponse? response = await _minioClient.PutObjectAsync(new PutObjectArgs()
            .WithBucket(bucketName)
            .WithObject(uniqueFileName)
            .WithStreamData(fileStream)
            .WithObjectSize(fileStream.Length)
            .WithContentType(contentType));

        return $"{bucketName}/{uniqueFileName}";
    }

    public async Task DeleteFolderAsync(string bucketName, string folderPrefix)
    {
        List<string> objectNames = new List<string>();

        ListObjectsArgs? listArgs = new ListObjectsArgs()
            .WithBucket(bucketName)
            .WithPrefix(folderPrefix)
            .WithRecursive(true);

        await foreach (Item item in _minioClient.ListObjectsEnumAsync(listArgs))
        {
            objectNames.Add(item.Key);
        }

        if (objectNames.Count == 0)
        {
            Console.WriteLine("Нет объектов для удаления.");
            return;
        }

        RemoveObjectsArgs? removeArgs = new RemoveObjectsArgs()
            .WithBucket(bucketName)
            .WithObjects(objectNames);

        IList<DeleteError>? removeErrors = await _minioClient.RemoveObjectsAsync(removeArgs);

        foreach (DeleteError error in removeErrors)
        {
            Console.WriteLine($"[Ошибка удаления]: {error.Key} - {error.Message}");
        }

        Console.WriteLine("Папка успешно удалена.");
    }

    public async Task<Stream> DownloadAsync(string fileName, string bucketName)
    {
        MemoryStream memoryStream = new();

        await _minioClient.GetObjectAsync(new GetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(fileName)
            .WithCallbackStream(stream => stream.CopyTo(memoryStream)));

        memoryStream.Position = 0;
        return memoryStream;
    }

    public async Task DeleteAsync(string fileName, string bucketName)
    {
        await _minioClient.RemoveObjectAsync(new RemoveObjectArgs()
            .WithBucket(bucketName)
            .WithObject(fileName));
    }

    public async Task<bool> ExistsAsync(string fileName, string bucketName)
    {
        try
        {
            await _minioClient.StatObjectAsync(new StatObjectArgs()
                .WithBucket(bucketName)
                .WithObject(fileName));
            return true;
        }
        catch (MinioException)
        {
            return false;
        }
    }

    private static string GenerateUniqueFileName(Guid userId, string originalFileName)
    {
        string extension = Path.GetExtension(originalFileName);
        return $"{userId}/{Guid.NewGuid():N}{extension}";
    }
}