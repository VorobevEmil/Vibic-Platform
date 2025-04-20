namespace MediaService.Web.Models.Hub;

public record CallUserRequest(string TargetUserId, string FromUsername, string FromAvatarUrl, string ChannelId);