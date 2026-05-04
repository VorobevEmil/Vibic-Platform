import { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import CallRequestType from '../../types/CallRequestType';

interface Props {
  callInfo: CallRequestType;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({ callInfo, onAccept, onReject }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
        const audio = new Audio('/sounds/ringtone.mp3');
        audio.loop = true;
        audio.volume = 0.8;
        audio.play().catch((e) => {
            console.warn('🔇 Не удалось воспроизвести звук:', e);
        });
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

  const isVideoCall = callInfo.isCamOn ?? true;

  return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#171b27] text-white p-8 rounded-2xl shadow-2xl w-96 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                {/* Avatar with pulse animation */}
                <div className="relative">
                    <img
                        src={callInfo.initiatorAvatarUrl}
                        alt={callInfo.initiatorUsername}
                        className="w-24 h-24 rounded-full border-4 border-emerald-400/50 object-cover shadow-lg animate-pulse"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-400 rounded-full p-2">
                        {isVideoCall ? 
                            <Video className="w-5 h-5 text-white" /> : 
                            <Phone className="w-5 h-5 text-white" />
                        }
                    </div>
                </div>
                
                <div className="text-center">
                    <h2 className="text-2xl font-bold">{callInfo.initiatorUsername}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {isVideoCall ? 'Входящий видеозвонок...' : 'Входящий звонок...'}
                    </p>
                </div>
                
                <div className="flex gap-6 mt-4">
                    <button 
                        onClick={onReject} 
                        className="flex flex-col items-center gap-2 px-6 py-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-all duration-200 group"
                    >
                        <div className="p-4 bg-red-500/20 group-hover:bg-red-500 rounded-full transition-colors">
                            <PhoneOff className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-medium">Отклонить</span>
                    </button>
                    
                    <button 
                        onClick={onAccept} 
                        className="flex flex-col items-center gap-2 px-6 py-4 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white rounded-2xl transition-all duration-200 group"
                    >
                        <div className="p-4 bg-green-500/20 group-hover:bg-green-500 rounded-full transition-colors">
                            <Phone className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-medium">Принять</span>
                    </button>
                </div>
            </div>
        </div>
    );
}