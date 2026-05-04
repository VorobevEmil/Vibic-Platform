import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { notificationApi, NotificationType } from '../api/notificationApi';
import { notificationHubConnection } from '../services/signalRNotificationClient';
import { useAuthContext } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationType[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { selfUser } = useAuthContext();
  const selfUserId = selfUser?.id;
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isConnected = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!selfUserId) return;

    try {
      const [notifsResponse, countResponse] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount()
      ]);

      setNotifications(notifsResponse.data);
      setUnreadCount(countResponse.data.count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selfUserId]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } as NotificationType : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true }) as NotificationType));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!selfUserId) return;

    fetchNotifications();

    const connectHub = async () => {
      try {
        if (notificationHubConnection.state === 'Disconnected') {
          await notificationHubConnection.start();
          isConnected.current = true;
        }

        notificationHubConnection.on('ReceiveNotification', (notification: NotificationType) => {
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        });

        notificationHubConnection.on('NotificationsRead', (ids: string[] | null) => {
          if (ids === null) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true }) as NotificationType));
            setUnreadCount(0);
          } else {
            setNotifications(prev =>
              prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } as NotificationType : n)
            );
            setUnreadCount(prev => Math.max(0, prev - ids.length));
          }
        });

      } catch (error) {
        console.error('Failed to connect to notification hub:', error);
      }
    };

    connectHub();

    return () => {
      if (isConnected.current) {
        notificationHubConnection.off('ReceiveNotification');
        notificationHubConnection.off('NotificationsRead');
        notificationHubConnection.stop();
        isConnected.current = false;
      }
    };
  }, [selfUserId, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
