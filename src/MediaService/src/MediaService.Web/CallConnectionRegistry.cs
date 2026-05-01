using System.Collections.Concurrent;

namespace MediaService.Web;

public static class CallConnectionRegistry
{
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> UserConnections = new();

    public static void Register(string userId, string connectionId)
    {
        ConcurrentDictionary<string, byte> connections = UserConnections.GetOrAdd(
            userId,
            _ => new ConcurrentDictionary<string, byte>());

        connections[connectionId] = 0;
    }

    public static void Remove(string userId, string connectionId)
    {
        if (!UserConnections.TryGetValue(userId, out ConcurrentDictionary<string, byte>? connections))
        {
            return;
        }

        connections.TryRemove(connectionId, out _);

        if (connections.IsEmpty)
        {
            UserConnections.TryRemove(new KeyValuePair<string, ConcurrentDictionary<string, byte>>(userId, connections));
        }
    }

    public static IReadOnlyList<string> GetConnectionIds(string userId)
    {
        return UserConnections.TryGetValue(userId, out ConcurrentDictionary<string, byte>? connections)
            ? connections.Keys.ToArray()
            : [];
    }
}
