using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using Vibic.Shared.Core.Interfaces;

namespace Vibic.Shared.Core.Telemetry;

public class TelemetryOptions : IAppOptions
{
    public static string ConfigSectionName => "Telemetry";

    [Required]
    public string ServiceName { get; init; } = string.Empty;

    public string? OtlpEndpoint { get; init; }
}

public class TelemetryOptionsValidator : IValidateOptions<TelemetryOptions>
{
    public ValidateOptionsResult Validate(string? name, TelemetryOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.ServiceName))
            return ValidateOptionsResult.Fail("Telemetry:ServiceName is required");

        return ValidateOptionsResult.Success;
    }
}
