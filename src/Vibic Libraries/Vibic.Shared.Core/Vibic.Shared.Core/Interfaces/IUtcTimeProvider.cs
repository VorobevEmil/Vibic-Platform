namespace Vibic.Shared.Core.Interfaces;

public interface IUtcTimeProvider
{
    DateTime UtcNow { get; }
    DateTime Today { get; }
}
