using System.ComponentModel.DataAnnotations;

namespace ChatChannelService.Web.Models.Servers.Requests;

public class ServerRequest
{
    [Required]
    public required string Name { get; init; } = string.Empty;
}