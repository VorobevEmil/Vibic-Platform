import { useState } from 'react';
import {
  Settings,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  PhoneOff,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useMedia } from '../../context/MediaContext';
import UserProfileCard from '../Footer/UserProfileCard';
import UserSettingsModal from '../Footer/UserSettingsModal';
import { resolveAssetUrl } from '../../api/httpClient';
import { useVoice } from '../../context/VoiceContext';
import { useCallContext } from '../../context/CallContext';
import { getUserStatusOption } from '../../utils/userStatus';

export default function FooterProfilePanel() {
  const { selfUser: user } = useAuthContext();
  const { isMicOn, isHeadphonesOn, setIsMicOn, setIsHeadphonesOn } = useMedia();
  const { currentChannelId, leaveChannel } = useVoice();
  const { isCallActive, endCall } = useCallContext();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  const statusOption = getUserStatusOption(user.userStatus);

  return (
    <section
      className="absolute w-[312px] left-2 bottom-2 px-3 py-2 rounded-lg border border-gray-700  bg-[#1e1f22]">
      <div className="flex items-center justify-between text-sm text-white gap-5">
        <div
          className="w-full flex items-center gap-2 p-1 rounded-md hover:bg-[#2b2d31] cursor-pointer transition-all"
          onClick={() => setShowProfile(true)}
        >
          <img
            src={resolveAssetUrl(user.avatarUrl)}
            className="w-8 h-8 rounded-full"
            alt={user.username}
          />
          <div>
            <div className="font-semibold">{user.displayName}</div>
            <div className={`text-xs ${statusOption.badgeClassName}`}>
              {statusOption.label}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(isCallActive || currentChannelId) && (
            <button
              onClick={() => (isCallActive ? endCall() : leaveChannel())}
              className="p-2 bg-[#2b2d31] rounded-full hover:bg-[#404249] border border-[#3a3c42]"
              title="Отключиться"
            >
              <PhoneOff className="w-5 h-5 text-gray-200" />
            </button>
          )}
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

          <button
            type="button"
            onClick={() => {
              setShowProfile(false);
              setShowSettings(true);
            }}
            title="Настройки пользователя"
          >
            <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {showProfile && (
          <UserProfileCard
            onClose={() => setShowProfile(false)}
            onOpenSettings={() => {
              setShowProfile(false);
              setShowSettings(true);
            }}
          />
        )}
      </div>

      {showSettings && <UserSettingsModal onClose={() => setShowSettings(false)} />}
    </section>
  );
}
