import MessageResponse from '../types/MessageType';
import CursorPaginatedResult from '../types/CursorPaginatedResult';
import { http } from './httpClient';

export const messagesApi = {
  getMessagesByChannelId: (channelId: string, cursor?: string) => {
    const url = new URL(`/channels/${channelId}/messages`, http.defaults.baseURL);

    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }

    return http.get<CursorPaginatedResult<MessageResponse>>(url.toString());
  },
  getMessagesByServerIdAndChannelId: (serverId: string, channelId: string, cursor?: string) => {
    const url = new URL(`/servers/${serverId}/channels/${channelId}/messages`, http.defaults.baseURL);

    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }

    return http.get<CursorPaginatedResult<MessageResponse>>(url.toString());

  }
};
