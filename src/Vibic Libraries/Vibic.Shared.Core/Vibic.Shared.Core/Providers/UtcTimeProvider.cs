using Vibic.Shared.Core.Interfaces;

namespace Vibic.Shared.Core.Providers;

public class UtcTimeProvider : IUtcTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
    public DateTime Today => DateTime.Today;
}
