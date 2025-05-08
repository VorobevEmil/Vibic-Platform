import { useState } from 'react';
import {
  Settings,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useMedia } from '../../context/MediaContext';
import UserProfileCard from '../Footer/UserProfileCard';

export default function FooterProfilePanel() {
  const { selfUser: user } = useAuthContext();
  const { isMicOn, isHeadphonesOn, setIsMicOn, setIsHeadphonesOn } = useMedia();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) {
    return (
      <section
        className="absolute w-[312px] left-2 bottom-2 px-3 py-2 rounded-lg border border-gray-700  bg-[#1e1f22]">
        <div className="w-full px-3 py-2 bg-[#1e1f22] text-sm text-white opacity-50 animate-pulse">
          Загрузка профиля...
        </div>
      </section>
    );
  }

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
    <section
      className="absolute w-[312px] left-2 bottom-2 px-3 py-2 rounded-lg border border-gray-700  bg-[#1e1f22]">
      <div className="flex items-center justify-between text-sm text-white gap-5">
        <div
          className="w-full flex items-center gap-2 p-1 rounded-md hover:bg-[#2b2d31] cursor-pointer transition-all"
          onClick={() => setShowProfile(true)}
        >
          <img
            src={user.avatarUrl}
            className="w-8 h-8 rounded-full"
            alt={user.username}
          />
          <div>
            <div className="font-semibold">{user.displayName}</div>
            <div className={`text-xs ${statusColorMap[user.userStatus]}`}>
              {statusTextMap[user.userStatus] || 'Неизвестно'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsMicOn((prev) => !prev)}>
            {isMicOn ? (
              <Mic className="w-5 h-5 text-gray-400 hover:text-white" />
            ) : (
              <MicOff className="w-5 h-5 text-gray-400 hover:text-white" />
            )}
          </button>

          <button onClick={() => setIsHeadphonesOn((prev) => !prev)}>
            {isHeadphonesOn ? (
              <Headphones className="w-5 h-5 text-gray-400 hover:text-white" />
            ) : (
              <HeadphoneOff className="w-5 h-5 text-gray-400 hover:text-white" />
            )}
          </button>

          <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
        </div>

        {showProfile && <UserProfileCard onClose={() => setShowProfile(false)} />}
      </div>
    </section>
  );
}
