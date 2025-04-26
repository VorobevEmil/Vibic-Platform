using System.Net.Http.Headers;
using UserService.Application.Interfaces;
using UserService.Infrastructure.Constants;

namespace UserService.Infrastructure.FileStorage;

public class FileStorageClient : IFileStorageClient
{
    private readonly IHttpClientFactory _httpClientFactory;

    public FileStorageClient(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName)
    {
        HttpClient httpClient = _httpClientFactory.CreateClient(HttpClientConstants.FileService);
        MultipartFormDataContent content = new();
        StreamContent streamContent = new(fileStream);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");

        content.Add(streamContent, "file", fileName);

        HttpResponseMessage response = await httpClient.PostAsync($"files/avatars/{userId}", content);

        response.EnsureSuccessStatusCode();

        string url = await response.Content.ReadAsStringAsync();
        return url;
    }

    public async Task<Stream> GetUserAvatarAsync(Guid userId, string fileName)
    {
        HttpClient httpClient = _httpClientFactory.CreateClient(HttpClientConstants.FileService);

        string requestUrl = $"files/avatars/{userId}/{fileName}";

        HttpResponseMessage response = await httpClient.GetAsync(requestUrl);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Не удалось получить аватарку пользователя: {response.StatusCode}");
        }

        Stream stream = await response.Content.ReadAsStreamAsync();
        return stream;
    }
}