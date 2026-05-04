import { Bell } from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext';

export default function NotificationBell({ onClick }: { onClick: () => void }) {
  const { unreadCount } = useNotificationContext();

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/8 hover:text-white"
      title="Уведомления"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
