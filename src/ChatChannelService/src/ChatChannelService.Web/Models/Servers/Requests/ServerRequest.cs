using System.ComponentModel.DataAnnotations;

namespace ChatChannelService.Web.Models.Servers.Requests;

public class ServerRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
}