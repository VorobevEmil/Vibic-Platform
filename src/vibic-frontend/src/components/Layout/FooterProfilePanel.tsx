import { useState } from 'react';
import {
  Settings,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useMedia } from '../../context/MediaContext';
import UserProfileCard from '../Footer/UserProfileCard';
import UserSettingsModal from '../Footer/UserSettingsModal';
import { resolveAssetUrl } from '../../api/httpClient';
import { useVoice } from '../../context/VoiceContext';
import { useCallContext } from '../../context/CallContext';
import { getUserStatusOption } from '../../utils/userStatus';
import NotificationBell from '../Notifications/NotificationBell';
import NotificationPanel from '../Notifications/NotificationPanel';

export default function FooterProfilePanel() {
  const { selfUser: user } = useAuthContext();
  const { isMicOn, isHeadphonesOn, setIsMicOn, toggleHeadphones } = useMedia();
  const { currentChannelId, activeVoiceSession, leaveChannel } = useVoice();
  const { activeCallRequest, isCallActive, endCall } = useCallContext();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) {
    return (
      <section className="absolute bottom-2 left-2 w-[312px] rounded-xl border border-white/[0.06] bg-[#0e1016] px-3 py-2.5">
        <div className="flex items-center gap-2.5 px-1 py-0.5 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-white/[0.08] shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="h-3 w-24 bg-white/[0.07] rounded-full" />
            <div className="h-2.5 w-16 bg-white/[0.05] rounded-full" />
          </div>
          <div className="flex gap-0.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
            <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
            <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
          </div>
        </div>
      </section>
    );
  }

  const statusOption = getUserStatusOption(user.userStatus);
  const isInCall = isCallActive || !!currentChannelId;
  const activeCallLabel = activeCallRequest
    ? `@${activeCallRequest.isInitiator ? activeCallRequest.peerUsername : activeCallRequest.initiatorUsername}`
    : activeVoiceSession?.channelName
      ? `# ${activeVoiceSession.channelName}`
      : currentChannelId
        ? 'Голосовой канал'
        : null;

  const returnToActiveCall = () => {
    if (activeCallRequest) {
      navigate(`/channels/@me/${activeCallRequest.channelId}`);
      return;
    }

    if (activeVoiceSession) {
      navigate(`/channels/${activeVoiceSession.serverId}/${activeVoiceSession.channelId}`);
    }
  };

  const handleQuickDisconnect = () => {
    if (isCallActive) {
      endCall();
    } else if (currentChannelId) {
      leaveChannel();
    }
  };

  return (
    <>
    {showNotifications && (
      <div className="fixed left-4 z-[100]" style={{ bottom: '76px' }}>
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      </div>
    )}
    <section className="absolute bottom-2 left-2 w-[312px] rounded-xl border border-white/[0.06] bg-[#0e1016] shadow-2xl shadow-black/50">
      {isInCall && activeCallLabel && (
        <div className="flex items-center gap-2.5 border-b border-white/[0.05] bg-emerald-500/[0.06] px-3 py-2 rounded-t-xl overflow-hidden">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
          <button
            type="button"
            onClick={returnToActiveCall}
            className="min-w-0 flex-1 text-left"
            title="Вернуться к звонку"
          >
            <div className="truncate text-xs font-semibold text-emerald-300">В звонке</div>
            <div className="truncate text-xs text-[#6b7292]">{activeCallLabel}</div>
          </button>
          <button
            type="button"
            onClick={handleQuickDisconnect}
            title="Завершить звонок"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400 transition-all duration-150 hover:bg-red-500 hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 rotate-[135deg]" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 px-2 py-2">
        {/* Avatar + Info */}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-all duration-150 hover:bg-white/[0.05]"
          onClick={() => setShowProfile(true)}
        >
          <div className="relative shrink-0">
            <img
              src={resolveAssetUrl(user.avatarUrl)}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/[0.08]"
              alt={user.username}
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0e1016] ${statusOption.badgeClassName.replace('text-', 'bg-').split(' ')[0]}`}
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
            onClick={() => !isHeadphonesOn ? toggleHeadphones() : setIsMicOn((prev) => !prev)}
            title={
              !isHeadphonesOn
                ? 'Вы заглушены — нажмите для включения звука'
                : isMicOn
                ? 'Выключить микрофон'
                : 'Включить микрофон'
            }
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ${
              isMicOn && isHeadphonesOn
                ? 'text-[#555c78] hover:bg-white/[0.07] hover:text-white'
                : 'bg-red-500/12 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {isMicOn && isHeadphonesOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>

          {/* Headphones toggle */}
          <button
            type="button"
            onClick={toggleHeadphones}
            title={isHeadphonesOn ? 'Заглушить звук' : 'Включить звук'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ${
              isHeadphonesOn
                ? 'text-[#555c78] hover:bg-white/[0.07] hover:text-white'
                : 'bg-red-500/12 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {isHeadphonesOn ? (
              <Headphones className="h-4 w-4" />
            ) : (
              <HeadphoneOff className="h-4 w-4" />
            )}
          </button>

          {/* Notifications */}
          <NotificationBell onClick={() => setShowNotifications(!showNotifications)} />

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              setShowProfile(false);
              setShowSettings(true);
            }}
            title="Настройки"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555c78] transition-all duration-150 hover:bg-white/[0.07] hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Disconnect call — far right, only when active */}
          {isInCall && (
            <>
              <div className="mx-1 h-4 w-px bg-white/[0.08]" />
              <button
                type="button"
                onClick={() => (isCallActive ? endCall() : leaveChannel())}
                title="Завершить звонок"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400 transition-all duration-150 hover:bg-red-500 hover:text-white"
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
    </>
  );
}
