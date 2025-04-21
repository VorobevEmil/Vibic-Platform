export default interface CursorPaginatedResult<T> {
    items: T[];
    cursor?: string;
    hasMore: boolean;
  }
  