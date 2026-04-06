import { useState } from 'react';
import {
  Settings,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  Phone,
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
      <section className="absolute bottom-2 left-2 w-[312px] rounded-xl border border-white/8 bg-[#1a1b1f] px-3 py-2.5">
        <div className="animate-pulse text-sm text-white/40">Загрузка профиля...</div>
      </section>
    );
  }

  const statusOption = getUserStatusOption(user.userStatus);
  const isInCall = isCallActive || !!currentChannelId;

  return (
    <section className="absolute bottom-2 left-2 w-[312px] overflow-hidden rounded-xl border border-white/8 bg-[#1a1b1f] shadow-xl">
      <div className="flex items-center gap-1 px-2 py-2">
        {/* Avatar + Info */}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/6"
          onClick={() => setShowProfile(true)}
        >
          <div className="relative shrink-0">
            <img
              src={resolveAssetUrl(user.avatarUrl)}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
              alt={user.username}
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1a1b1f] ${statusOption.badgeClassName.replace('text-', 'bg-').split(' ')[0]}`}
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white leading-tight">
              {user.displayName}
            </div>
            <div className={`text-xs leading-tight ${statusOption.badgeClassName}`}>
              {statusOption.label}
            </div>
          </div>
        </button>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-0.5">
          {/* Mic toggle */}
          <button
            type="button"
            onClick={() => setIsMicOn((prev) => !prev)}
            title={isMicOn ? 'Выключить микрофон' : 'Включить микрофон'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isMicOn
                ? 'text-gray-400 hover:bg-white/8 hover:text-white'
                : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
            }`}
          >
            {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>

          {/* Headphones toggle */}
          <button
            type="button"
            onClick={() => setIsHeadphonesOn((prev) => !prev)}
            title={isHeadphonesOn ? 'Выключить звук' : 'Включить звук'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isHeadphonesOn
                ? 'text-gray-400 hover:bg-white/8 hover:text-white'
                : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
            }`}
          >
            {isHeadphonesOn ? (
              <Headphones className="h-4 w-4" />
            ) : (
              <HeadphoneOff className="h-4 w-4" />
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              setShowProfile(false);
              setShowSettings(true);
            }}
            title="Настройки"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/8 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Disconnect call — far right, only when active */}
          {isInCall && (
            <>
              <div className="mx-1 h-5 w-px bg-white/10" />
              <button
                type="button"
                onClick={() => (isCallActive ? endCall() : leaveChannel())}
                title="Завершить звонок"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
              >
                <Phone className="h-4 w-4 rotate-[135deg]" />
              </button>
            </>
          )}
        </div>
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

      {showSettings && <UserSettingsModal onClose={() => setShowSettings(false)} />}
    </section>
  );
}
