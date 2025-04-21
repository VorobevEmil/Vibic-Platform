namespace ChatChannelService.Application.Common.Pagination;

public record CursorPaginatedResult<T>(List<T> Items, string? Cursor, bool HasMore);