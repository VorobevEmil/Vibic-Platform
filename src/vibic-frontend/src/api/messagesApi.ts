import MessageType from '../types/MessageType';
import { http } from './httpClient';

export const messagesApi = {
    getMessagesByChannelId: (channelId: string) =>
      http.get<MessageType[]>(`https://localhost:7138/channels/${channelId}/messages`)
  };