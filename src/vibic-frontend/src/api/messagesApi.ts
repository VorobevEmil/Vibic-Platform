import MessageType from '../types/MessageType';
import CursorPaginatedResult from '../types/CursorPaginatedResult';
import { http } from './httpClient';

export const messagesApi = {
  getMessagesByChannelId: (channelId: string, cursor?: string) => {
    const url = new URL(`http://localhost:7138/channels/${channelId}/messages`);

    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }

    return http.get<CursorPaginatedResult<MessageType>>(url.toString());
  }
};
