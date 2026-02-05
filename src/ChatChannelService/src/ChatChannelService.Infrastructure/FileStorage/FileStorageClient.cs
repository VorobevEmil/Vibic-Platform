using System.Net.Http.Headers;
using ChatChannelService.Application.Interfaces;
using ChatChannelService.Infrastructure.Constants;

namespace ChatChannelService.Infrastructure.FileStorage;

public class FileStorageClient : IFileStorageClient
{
    private readonly IHttpClientFactory _httpClientFactory;

    public FileStorageClient(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string> UploadServerIconAsync(Guid serverId, Stream fileStream, string fileName)
    {
        HttpClient httpClient = _httpClientFactory.CreateClient(HttpClientConstants.FileService);
        MultipartFormDataContent content = new();
        StreamContent streamContent = new(fileStream);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");

        content.Add(streamContent, "file", fileName);

        HttpResponseMessage response = await httpClient.PostAsync($"files/servers/{serverId}", content);

        response.EnsureSuccessStatusCode();

        string uploadedFileName = await response.Content.ReadAsStringAsync();
        return uploadedFileName;
    }
}
