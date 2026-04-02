namespace Vibic.Shared.Core.Services;

public interface ICorrelationIdAccessor
{
    string CorrelationId { get; set; }
}
