import { Settings, Mic, Headphones } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FooterProfilePanel() {
  const user = useAuth();

  if (!user) {
    return (
      <div className="w-full px-3 py-2 bg-[#1e1f22] text-sm text-white opacity-50 animate-pulse">
        Загрузка профиля...
      </div>
    );
  }

  // 🎯 Маппинг чисел на текст и цвет
  const statusTextMap: Record<number, string> = {
    1: 'В сети',
    2: 'Нет на месте',
    3: 'Не беспокоить',
    4: 'Не в сети',
    5: 'Невидимка',
  };

  const statusColorMap: Record<number, string> = {
    1: 'text-green-500',
    2: 'text-yellow-400',
    3: 'text-red-500',
    4: 'text-gray-500',
    5: 'text-purple-400',
  };

  return (
    <div className="w-full px-3 py-2 bg-[#1e1f22] flex items-center justify-between text-sm text-white">
      <div className="flex items-center gap-2">
        <img
          src={user.avatarUrl || 'https://via.placeholder.com/32'}
          className="w-8 h-8 rounded-full"
          alt={user.username}
        />
        <div>
          <div className="font-semibold">{user.username}</div>
          <div className={`text-xs ${statusColorMap[user.userStatus]}`}>
            {statusTextMap[user.userStatus] || 'Неизвестно'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Mic className="w-5 h-5 text-gray-400 hover:text-white" />
        <Headphones className="w-5 h-5 text-gray-400 hover:text-white" />
        <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
      </div>
    </div>
  );
}