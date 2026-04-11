import type { Ref } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import CallRequestType from '../../types/CallRequestType';
import { useMedia } from '../../context/MediaContext';
import { resolveAssetUrl } from '../../api/httpClient';

interface CallPanelProps {
  callRequest: CallRequestType;
  height: number;
  localVideoRef: Ref<HTMLVideoElement>;
  remoteVideoRef: Ref<HTMLVideoElement>;
  isCamOn: boolean;
  isMicOn: boolean;
  isRemoteCamOn: boolean;
  isRemoteMicOn: boolean;
  remoteStreamStarted: boolean;
  toggleCam: () => void;
  closeCall: (byUser: boolean) => void;
}

export default function CallPanel({
  callRequest,
  height,
  localVideoRef,
  remoteVideoRef,
  isCamOn,
  isMicOn,
  isRemoteCamOn,
  isRemoteMicOn,
  remoteStreamStarted,
  toggleCam,
  closeCall,
}: CallPanelProps) {
  const { selfUser } = useAuthContext();
  const { setIsMicOn } = useMedia();

  const remoteUsername = callRequest.isInitiator
    ? callRequest.peerUsername
    : callRequest.initiatorUsername;

  const remoteAvatarUrl = callRequest.isInitiator
    ? callRequest.peerAvatarUrl
    : callRequest.initiatorAvatarUrl;

  const localPreviewHeight = Math.max(112, Math.min(190, Math.round(height * 0.34)));
  const localPreviewWidth = Math.round(localPreviewHeight * (4 / 3));

  return (
    <div className="w-full px-4 pt-4 text-white" style={{ height }}>
      <div className="relative h-full overflow-hidden rounded-[24px] border border-white/10 bg-[#111318] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_42%),linear-gradient(180deg,#151820_0%,#0e1016_100%)]" />

        <div className="absolute inset-0 p-4">
          <div className="relative h-full overflow-hidden rounded-[20px] border border-white/10 bg-[#1b1d24]">
            <div className={`absolute inset-0 flex items-center justify-center bg-[#10131a] ${remoteStreamStarted && isRemoteCamOn ? '' : 'hidden'}`}>
              <video
                ref={remoteVideoRef}
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>

            {!remoteStreamStarted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1b1d24] text-center">
                <img
                  src={resolveAssetUrl(remoteAvatarUrl)}
                  alt="user-avatar"
                  className="h-24 w-24 rounded-full border-2 border-white/80 object-cover shadow-lg animate-pulse"
                />
                <span className="mt-4 text-sm font-medium text-gray-300 animate-pulse">
                  Ожидание подключения...
                </span>
              </div>
            )}

            {remoteStreamStarted && !isRemoteCamOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1b1d24]">
                <img
                  src={resolveAssetUrl(remoteAvatarUrl)}
                  alt="avatar"
                  className="h-24 w-24 rounded-full border-2 border-white/80 object-cover shadow-lg"
                />
              </div>
            )}

            <div className="absolute left-4 top-4 flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1117]/80 px-4 py-2 text-sm shadow-lg backdrop-blur">
              <span className="font-semibold text-white">{remoteUsername}</span>
              {isRemoteMicOn ? (
                <Mic className="h-4 w-4 text-emerald-400" />
              ) : (
                <MicOff className="h-4 w-4 text-rose-400" />
              )}
              {isRemoteCamOn ? (
                <Video className="h-4 w-4 text-emerald-400" />
              ) : (
                <VideoOff className="h-4 w-4 text-rose-400" />
              )}
            </div>
          </div>
        </div>

        <div
          className="absolute right-6 top-6 overflow-hidden rounded-[18px] border border-white/15 bg-[#151820] shadow-2xl backdrop-blur"
          style={{ width: `${localPreviewWidth}px`, height: `${localPreviewHeight}px` }}
        >
          <div className={`absolute inset-0 flex items-center justify-center bg-[#10131a] ${isCamOn ? '' : 'hidden'}`}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="h-full w-full object-contain"
            />
          </div>

          {!isCamOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#151820]">
              <img
                src={resolveAssetUrl(selfUser?.avatarUrl)}
                alt="avatar"
                className="h-16 w-16 rounded-full border-2 border-white/80 object-cover shadow-md"
              />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3 pt-8 text-xs">
            <span className="font-semibold text-white">{selfUser?.username || 'Вы'}</span>
            <div className="flex items-center gap-2">
              {isMicOn ? (
                <Mic className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <MicOff className="h-3.5 w-3.5 text-rose-400" />
              )}
              {isCamOn ? (
                <Video className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <VideoOff className="h-3.5 w-3.5 text-rose-400" />
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#0f1117]/85 px-4 py-3 shadow-2xl backdrop-blur">
          <button
            type="button"
            onClick={() => setIsMicOn((prev) => !prev)}
            className={`rounded-full p-3 transition ${
              isMicOn ? 'bg-white/8 text-white hover:bg-white/14' : 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
            }`}
            aria-label={isMicOn ? 'Выключить микрофон' : 'Включить микрофон'}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={toggleCam}
            className={`rounded-full p-3 transition ${
              isCamOn ? 'bg-white/8 text-white hover:bg-white/14' : 'bg-amber-500/20 text-amber-100 hover:bg-amber-500/30'
            }`}
            aria-label={isCamOn ? 'Выключить камеру' : 'Включить камеру'}
          >
            {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => closeCall(true)}
            className="rounded-full bg-rose-500 p-3 text-white transition hover:bg-rose-400"
            aria-label="Завершить звонок"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
