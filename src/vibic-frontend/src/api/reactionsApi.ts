import { http } from './httpClient';

export interface ReactionType {
  id: string;
  emoji: string;
  userId: string;
  createdAt: string;
}

export const reactionsApi = {
  addReaction: (messageId: string, emoji: string) =>
    http.post(`/messages/${messageId}/reactions`, { emoji }),
  
  removeReaction: (messageId: string, emoji: string) =>
    http.delete(`/messages/${messageId}/reactions`, { params: { emoji } })
};
