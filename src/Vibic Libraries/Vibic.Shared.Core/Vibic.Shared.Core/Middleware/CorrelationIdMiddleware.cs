using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Services;

namespace Vibic.Shared.Core.Middleware;

public class CorrelationIdMiddleware(RequestDelegate next)
{
    private const string HeaderName = "X-Correlation-ID";

    public async Task InvokeAsync(HttpContext context, ICorrelationIdAccessor accessor)
    {
        string correlationId = context.Request.Headers[HeaderName].FirstOrDefault()
                               ?? Guid.NewGuid().ToString();

        accessor.CorrelationId = correlationId;

        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderName] = correlationId;
            return Task.CompletedTask;
        });

        await next(context);
    }
}
