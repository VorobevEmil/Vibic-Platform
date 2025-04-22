import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface CallMediaControlsProps {
    isMicOn: boolean;
    isCamOn: boolean;
    onToggleMic: () => void;
    onToggleCam: () => void;
    onEndCall: () => void;
}

export default function CallMediaControls({
    isMicOn,
    isCamOn,
    onToggleMic,
    onToggleCam,
    onEndCall,
}: CallMediaControlsProps) {
    return (
        <div className="mt-6 flex gap-4">
            <button onClick={onToggleMic} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600">
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button onClick={onToggleCam} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600">
                {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button onClick={onEndCall} className="p-3 bg-red-600 rounded-full hover:bg-red-500">
                <PhoneOff className="w-5 h-5" />
            </button>
        </div>
    );
}