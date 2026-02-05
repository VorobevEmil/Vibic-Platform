using Microsoft.AspNetCore.Http;

namespace ChatChannelService.Web.Models.Servers.Requests;

public class ServerRequest
{
    public required string Name { get; init; } = string.Empty;
    public IFormFile? Icon { get; init; }
}
