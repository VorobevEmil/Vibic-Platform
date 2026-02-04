using System.ComponentModel.DataAnnotations;

namespace Vibic.Shared.Core.Attributes;

public sealed class AmqpUrlAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is not string s || string.IsNullOrWhiteSpace(s))
            return new ValidationResult("RabbitMQ connection string cannot be empty.");

        if (!Uri.TryCreate(s, UriKind.Absolute, out Uri? uri))
            return new ValidationResult("Invalid URI format.");

        if (!string.Equals(uri.Scheme, "amqp", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(uri.Scheme, "amqps", StringComparison.OrdinalIgnoreCase))
        {
            return new ValidationResult("URI scheme must be amqp or amqps.");
        }

        if (uri.Port <= 0)
            return new ValidationResult("URI must contain a valid port.");

        return ValidationResult.Success;
    }
}
