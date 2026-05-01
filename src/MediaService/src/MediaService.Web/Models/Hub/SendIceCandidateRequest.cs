namespace MediaService.Web.Models.Hub;

public record SendIceCandidateRequest(string ToUserId, object Candidate, string? Scope = null);
