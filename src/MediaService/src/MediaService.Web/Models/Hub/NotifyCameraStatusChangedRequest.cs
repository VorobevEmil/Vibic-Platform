namespace MediaService.Web.Models.Hub;

public record NotifyCameraStatusChangedRequest(string ToUserId, bool IsCameraOn);