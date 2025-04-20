using System.Collections.Concurrent;

namespace MediaService.Web;

public static class CallConnectionRegistry
{
    private static readonly ConcurrentDictionary<string, string> UserConnections = new();

    public static void Register(string userId, string connectionId)
        => UserConnections[userId] = connectionId;

    public static void Remove(string userId)
        => UserConnections.TryRemove(userId, out _);

    public static string? GetConnectionId(string userId)
        => UserConnections.GetValueOrDefault(userId);
}
