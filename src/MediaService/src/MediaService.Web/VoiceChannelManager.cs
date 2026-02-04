using System.Collections.Concurrent;
using MediaService.Web.Models;

namespace MediaService.Web;

public static class VoiceChannelManager
{
    private static readonly ConcurrentDictionary<string, List<VoiceUser>> ChannelUsers = new();

    private static readonly ConcurrentDictionary<string, string> ConnectionToChannel = new();

    private static readonly object Lock = new();

    public static void AddUser(string connectionId, string channelId, VoiceUser user)
    {
        lock (Lock)
        {
            List<VoiceUser> users = ChannelUsers.GetOrAdd(channelId, _ => new List<VoiceUser>());
            users.RemoveAll(u => u.UserId == user.UserId);
            users.Add(user);
        }

        ConnectionToChannel[connectionId] = channelId;
    }

    public static void RemoveUser(string connectionId, string userId, out string? channelId, out VoiceUser? removedUser)
    {
        removedUser = null;
        channelId = null;

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
}
