import { useEffect, useRef } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
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

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#2b2d31] text-white p-6 rounded-lg shadow-lg w-80 flex flex-col items-center gap-4">
                <img
                    src={callInfo.initiatorAvatarUrl}
                    alt={callInfo.initiatorUsername}
                    className="w-16 h-16 rounded-full border-2 border-white"
                />
                <h2 className="text-xl font-bold">{callInfo.initiatorUsername}</h2>
                <p className="text-sm text-gray-400">Входящий звонок...</p>
                <div className="flex gap-4 mt-2">
                    <button onClick={onAccept} className="bg-green-500 hover:bg-green-600 p-3 rounded-full">
                        <Phone className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={onReject} className="bg-red-500 hover:bg-red-600 p-3 rounded-full">
                        <PhoneOff className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}