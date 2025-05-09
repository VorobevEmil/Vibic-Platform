using MediaService.Web.Models;

namespace MediaService.Web;

public static class VoiceChannelManager
{
    private static readonly Dictionary<string, List<VoiceUser>> ChannelUsers = new();

    private static readonly Dictionary<string, string> ConnectionToChannel = new();

    public static void AddUser(string connectionId, string channelId, VoiceUser user)
    {
        if (!ChannelUsers.ContainsKey(channelId))
            ChannelUsers[channelId] = new List<VoiceUser>();

        ChannelUsers[channelId].RemoveAll(u => u.UserId == user.UserId);
        ChannelUsers[channelId].Add(user);

        ConnectionToChannel[connectionId] = channelId;
    }

    public static void RemoveUser(string connectionId, string userId, out string? channelId, out VoiceUser? removedUser)
    {
        removedUser = null;
        channelId = null;

        if (ConnectionToChannel.TryGetValue(connectionId, out string? chId))
        {
            channelId = chId;
            if (ChannelUsers.TryGetValue(chId, out List<VoiceUser>? users))
            {
                removedUser = users.FirstOrDefault(u => u.UserId == userId);
                users.RemoveAll(u => u.UserId == userId);
            }

            ConnectionToChannel.Remove(connectionId);
        }
    }

    public static List<VoiceUser> GetUsers(string channelId)
    {
        return ChannelUsers.TryGetValue(channelId, out List<VoiceUser>? users) ? users : new List<VoiceUser>();
    }
}
