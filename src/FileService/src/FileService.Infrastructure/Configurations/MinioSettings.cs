namespace FileService.Infrastructure.Configurations;

public class MinioSettings
{
    public required string AccessKey { get; init; }
    public required string SecretKey { get; init; }
    public required string Endpoint { get; init; }
}