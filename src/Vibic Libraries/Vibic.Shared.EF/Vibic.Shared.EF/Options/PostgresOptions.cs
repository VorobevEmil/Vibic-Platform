using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using Vibic.Shared.Core.Interfaces;

namespace Vibic.Shared.EF.Options;

internal sealed record PostgresOptions : IAppOptions
{
    public static string ConfigSectionName => "ConnectionStrings";

    [Required(AllowEmptyStrings = false)]
    public required string Postgres { get; init; }
}

[OptionsValidator]
internal sealed partial class PostgresOptionsValidator : IValidateOptions<PostgresOptions>;
