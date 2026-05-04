import { X, CheckCheck, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { friendsApi } from '../../api/friendsApi';
import { useNotificationContext } from '../../context/NotificationContext';

const FRIEND_REQUEST_RECEIVED = 0;

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotificationContext();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const getNotificationIcon = (type: number) => {
    switch (type) {
      case 0: return '👤';
      case 1: return '✅';
      case 2: return '💬';
      case 3: return '📨';
      case 4: return '📞';
      default: return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ч. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const handleFriendRequest = async (notificationId: string, requestId: string, action: 'accept' | 'reject') => {
    setPendingIds(prev => new Set(prev).add(notificationId));
    try {
      if (action === 'accept') {
        await friendsApi.acceptRequest(requestId);
      } else {
        await friendsApi.rejectRequest(requestId);
      }
      await markAsRead(notificationId);
    } catch {
      // request may have already been handled
    } finally {
      setPendingIds(prev => { const next = new Set(prev); next.delete(notificationId); return next; });
    }
  };

  return (
    <div className="w-80 rounded-xl border border-white/10 bg-[#0e1016] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Уведомления</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="text-xs text-gray-400 hover:text-white"
            title="Отметить все как прочитанные"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Загрузка...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Нет уведомлений
          </div>
        ) : (
          notifications.map((notification) => {
            const isFriendRequest = notification.type === FRIEND_REQUEST_RECEIVED && !!notification.relatedEntityId;
            const isPending = pendingIds.has(notification.id);

            return (
              <div
                key={notification.id}
                className={`flex gap-3 border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5 ${
                  !notification.isRead ? 'bg-white/[0.03]' : ''
                }`}
                onClick={() => !notification.isRead && !isFriendRequest && markAsRead(notification.id)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm ${!notification.isRead ? 'font-semibold text-white' : 'text-gray-300'}`}>
                    {notification.title}
                  </div>
                  {notification.content && (
                    <div className="truncate text-xs text-gray-400">
                      {notification.content}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDate(notification.createdAt)}
                  </div>
                  {isFriendRequest && !notification.isRead && (
                    <div className="mt-2 flex gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleFriendRequest(notification.id, notification.relatedEntityId!, 'accept')}
                        className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                      >
                        <UserCheck className="h-3 w-3" />
                        Принять
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleFriendRequest(notification.id, notification.relatedEntityId!, 'reject')}
                        className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-gray-300 hover:bg-white/20 disabled:opacity-50"
                      >
                        <UserX className="h-3 w-3" />
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
                {!notification.isRead && (
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
