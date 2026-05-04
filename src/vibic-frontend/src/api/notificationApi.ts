import { http } from './httpClient';

export interface NotificationType {
  id: string;
  type: number;
  title: string;
  content: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: (isRead?: boolean, limit = 50, offset = 0) =>
    http.get<NotificationType[]>('/notifications', {
      params: { isRead, limit, offset }
    }),
  
  getUnreadCount: () =>
    http.get<{ count: number }>('/notifications/unread-count'),
  
  markAsRead: (notificationId: string) =>
    http.post(`/notifications/${notificationId}/read`),
  
  markAllAsRead: () =>
    http.post('/notifications/read-all')
};
