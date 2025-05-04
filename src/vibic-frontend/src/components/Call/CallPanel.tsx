import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import CallRequestType from '../../types/CallRequestType';
import useCallConnection from '../../hooks/call/useCallConnection';
import { useMedia } from '../../context/MediaContext';

interface CallPanelProps {
  onClose: () => void;
  callRequest: CallRequestType;
}

export default function CallPanel({ onClose, callRequest }: CallPanelProps) {
  const { selfUser } = useAuthContext();

  const {
    localVideoRef,
    remoteVideoRef,
    isCamOn,
    isMicOn,
    isRemoteCamOn,
    isRemoteMicOn,
    remoteStreamStarted,
    toggleCam,
    closeCall,
  } = useCallConnection({
    callRequest,
    onClose
  });

  const { setIsMicOn } = useMedia();

  const remoteUsername = callRequest.isInitiator
    ? callRequest.peerUsername
    : callRequest.initiatorUsername;

  const remoteAvatarUrl = callRequest.isInitiator
    ? callRequest.peerAvatarUrl
    : callRequest.initiatorAvatarUrl;

  return (
    <div className="w-full h-1/2 bg-black text-white flex flex-col justify-center items-center relative px-4 py-2">
      <div className="flex flex-row gap-4 justify-center items-center">
        {/* Local user */}
        <div className="w-[320px] h-[240px] relative rounded-lg border-2 border-white shadow-lg bg-[#1e1f22]">
          <div className="absolute top-1 left-1 z-10 text-xs text-white flex gap-2 items-center">
            <span className="font-bold">{selfUser?.username || 'Вы'}</span>
            <Mic className={`w-4 h-4 ${isMicOn ? 'text-green-400' : 'text-red-500'}`} />
            <Video className={`w-4 h-4 ${isCamOn ? 'text-green-400' : 'text-red-500'}`} />
          </div>

          <video
            ref={localVideoRef}
            autoPlay
            muted
            className={`w-full h-full rounded-lg object-cover ${isCamOn ? '' : 'hidden'}`}
          />

          {!isCamOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={selfUser?.avatarUrl}
                alt="avatar"
                className="w-20 h-20 rounded-full border-2 border-white"
              />
            </div>
          )}
        </div>

        {/* Remote user */}
        <div className="w-[320px] h-[240px] relative rounded-lg border-2 border-green-500 shadow-lg bg-[#1e1f22]">
          <div className="absolute top-1 left-1 z-10 text-xs text-white flex gap-2 items-center">
            <span className="font-bold">{remoteUsername}</span>
            <Mic className={`w-4 h-4 ${isRemoteMicOn ? 'text-green-400' : 'text-red-500'}`} />
            <Video className={`w-4 h-4 ${isRemoteCamOn ? 'text-green-400' : 'text-red-500'}`} />
          </div>

          <video
            ref={remoteVideoRef}
            autoPlay
            className={`w-full h-full rounded-lg object-cover ${isRemoteCamOn ? '' : 'hidden'}`}
          />

          {!remoteStreamStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1f22]">
              <img
                src={remoteAvatarUrl}
                alt="user-avatar"
                className="w-20 h-20 rounded-full border-2 border-white animate-pulse"
              />
              <span className="mt-2 text-sm text-gray-400 animate-pulse">
                Ожидание подключения...
              </span>
            </div>
          )}

          {remoteStreamStarted && !isRemoteCamOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={remoteAvatarUrl}
                alt="avatar"
                className="w-20 h-20 rounded-full border-2 border-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        <button onClick={() => setIsMicOn((prev) => !prev)} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600">
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button onClick={toggleCam} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600">
          {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button onClick={() => closeCall(true)} className="p-3 bg-red-600 rounded-full hover:bg-red-500">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
