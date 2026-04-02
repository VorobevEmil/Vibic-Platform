using Vibic.Shared.Core.Services;

namespace Vibic.Shared.Core.Middleware;

public class CorrelationIdForwardingHandler(ICorrelationIdAccessor accessor) : DelegatingHandler
{
    private const string HeaderName = "X-Correlation-ID";

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(accessor.CorrelationId))
        {
            request.Headers.TryAddWithoutValidation(HeaderName, accessor.CorrelationId);
        }

        return base.SendAsync(request, cancellationToken);
    }
}
