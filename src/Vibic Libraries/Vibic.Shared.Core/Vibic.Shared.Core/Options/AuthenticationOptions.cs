using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using Vibic.Shared.Core.Interfaces;

namespace Vibic.Shared.Core.Options;

internal sealed record AuthenticationOptions : IAppOptions
{
    public static string ConfigSectionName => "Authentication";

    [Required, ValidateObjectMembers] public required JwtSettings Jwt { get; init; }
    public string? Authority { get; init; }
}

public sealed record JwtSettings
{
    [Required(AllowEmptyStrings = false)] public required string Issuer { get; init; }
    [Required(AllowEmptyStrings = false)] public required string Audience { get; init; }
    [Required(AllowEmptyStrings = false)] public required string Key { get; init; }
}

[OptionsValidator]
internal sealed partial class AuthenticationOptionsValidator : IValidateOptions<AuthenticationOptions>;
