using Microsoft.AspNetCore.Http;

namespace ChatChannelService.Web.Models.Servers.Requests;

public class UpdateServerRequest
{
    public string? Name { get; init; }
    public IFormFile? Icon { get; init; }
}
