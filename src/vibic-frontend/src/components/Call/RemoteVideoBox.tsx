import { forwardRef } from 'react';
import { Mic, Video } from 'lucide-react';

interface RemoteVideoBoxProps {
    isCamOn: boolean;
    isMicOn: boolean;
    isStreamStarted: boolean;
    username: string;
    avatarUrl: string;
}

const RemoteVideoBox = forwardRef<HTMLVideoElement, RemoteVideoBoxProps>(
    ({ isCamOn, isMicOn, isStreamStarted, username, avatarUrl }, videoRef) => {
        return (
            <div className="w-[320px] h-[240px] relative rounded-lg border-2 border-green-500 shadow-lg bg-[#1e1f22]">
                <div className="absolute top-1 left-1 z-10 text-xs text-white flex gap-2 items-center">
                    <span className="font-bold">{username}</span>
                    <Mic className={`w-4 h-4 ${isMicOn ? 'text-green-400' : 'text-red-500'}`} />
                    <Video className={`w-4 h-4 ${isCamOn ? 'text-green-400' : 'text-red-500'}`} />
                </div>

                <video
                    ref={videoRef}
                    autoPlay
                    className={`w-full h-full rounded-lg object-cover ${isCamOn ? '' : 'hidden'}`}
                />

                {!isStreamStarted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1f22]">
                        <img
                            src={avatarUrl}
                            alt="user-avatar"
                            className="w-20 h-20 rounded-full border-2 border-white animate-pulse"
                        />
                        <span className="mt-2 text-sm text-gray-400 animate-pulse">Ожидание подключения...</span>
                    </div>
                )}

                {isStreamStarted && !isCamOn && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className="w-20 h-20 rounded-full border-2 border-white"
                        />
                    </div>
                )}
            </div>
        );
    }
);

export default RemoteVideoBox;
