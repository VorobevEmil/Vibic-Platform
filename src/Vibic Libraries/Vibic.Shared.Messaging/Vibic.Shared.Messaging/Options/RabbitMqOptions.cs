using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using Vibic.Shared.Core.Interfaces;

namespace Vibic.Shared.Messaging.Options;

internal sealed record RabbitMqOptions : IAppOptions
{
    public static string ConfigSectionName => "ConnectionStrings";

    [Required(AllowEmptyStrings = false)]
    public required string RabbitMq { get; init; }
}

[OptionsValidator]
internal sealed partial class RabbitMqOptionsValidator : IValidateOptions<RabbitMqOptions>;
