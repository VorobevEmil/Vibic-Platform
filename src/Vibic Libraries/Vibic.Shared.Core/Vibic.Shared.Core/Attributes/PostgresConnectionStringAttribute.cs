using System.ComponentModel.DataAnnotations;
using Npgsql;

namespace Vibic.Shared.Core.Attributes;

public sealed class PostgresConnectionStringAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string s || string.IsNullOrWhiteSpace(s))
            return new ValidationResult("Postgres connection string cannot be empty.");

        try
        {
            NpgsqlConnectionStringBuilder builder = new(s);

            if (string.IsNullOrWhiteSpace(builder.Host))
                return new ValidationResult("Postgres connection string must specify 'Host'.");

            if (builder.Port <= 0)
                return new ValidationResult("Postgres connection string must specify a valid 'Port'.");

            if (string.IsNullOrWhiteSpace(builder.Database))
                return new ValidationResult("Postgres connection string must specify 'Database'.");

            if (string.IsNullOrWhiteSpace(builder.Username))
                return new ValidationResult("Postgres connection string must specify 'Username'.");

            return ValidationResult.Success;
        }
        catch (Exception)
        {
            return new ValidationResult("Invalid Postgres connection string.");
        }
    }
}
