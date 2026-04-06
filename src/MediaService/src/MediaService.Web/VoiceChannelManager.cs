using System.Collections.Concurrent;
using MediaService.Web.Models;

namespace MediaService.Web;

public static class VoiceChannelManager
{
    private static readonly ConcurrentDictionary<string, List<VoiceUser>> ChannelUsers = new();

    private static readonly ConcurrentDictionary<string, string> ConnectionToChannel = new();
    private static readonly ConcurrentDictionary<string, string> ConnectionToServer = new();

    private static readonly object Lock = new();

    public static void AddUser(string connectionId, string channelId, string serverId, VoiceUser user)
    {
        lock (Lock)
        {
            List<VoiceUser> users = ChannelUsers.GetOrAdd(channelId, _ => new List<VoiceUser>());
            users.RemoveAll(u => u.UserId == user.UserId);
            users.Add(user);
        }

        ConnectionToChannel[connectionId] = channelId;
        ConnectionToServer[connectionId] = serverId;
    }

    public static void RemoveUser(string connectionId, string userId, out string? channelId, out string? serverId, out VoiceUser? removedUser)
    {
        removedUser = null;
        channelId = null;
        serverId = null;

        if (ConnectionToChannel.TryRemove(connectionId, out string? chId))
        {
            channelId = chId;
            lock (Lock)
            {
                if (ChannelUsers.TryGetValue(chId, out List<VoiceUser>? users))
                {
                    removedUser = users.FirstOrDefault(u => u.UserId == userId);
                    users.RemoveAll(u => u.UserId == userId);
                }
            }
        }

        if (ConnectionToServer.TryRemove(connectionId, out string? srvId))
        {
            serverId = srvId;
        }
    }

    public static List<VoiceUser> GetUsers(string channelId)
    {
        lock (Lock)
        {
            return ChannelUsers.TryGetValue(channelId, out List<VoiceUser>? users)
                ? new List<VoiceUser>(users)
                : new List<VoiceUser>();
        }
    }

    public static bool UpdateMicStatus(string connectionId, string userId, bool isMicOn, out string? channelId, out string? serverId)
    {
        channelId = null;
        serverId = null;

        ConnectionToServer.TryGetValue(connectionId, out serverId);

        if (!ConnectionToChannel.TryGetValue(connectionId, out string? chId)) return false;
        channelId = chId;

        lock (Lock)
        {
            if (!ChannelUsers.TryGetValue(chId, out List<VoiceUser>? users)) return false;
            VoiceUser? user = users.FirstOrDefault(u => u.UserId == userId);
            if (user == null) return false;
            user.IsMicOn = isMicOn;
            return true;
        }
    }

    public static Dictionary<string, List<VoiceUser>> GetUsersForChannels(IEnumerable<string> channelIds)
    {
        Dictionary<string, List<VoiceUser>> result = new();
        lock (Lock)
        {
            foreach (string channelId in channelIds)
            {
                if (ChannelUsers.TryGetValue(channelId, out List<VoiceUser>? users))
                {
                    result[channelId] = new List<VoiceUser>(users);
                }
                else
                {
                    result[channelId] = new List<VoiceUser>();
                }
            }
        }

        return result;
    }
}
