import { Phone, PhoneOff } from 'lucide-react';

interface Props {
    caller: {
        fromUserId: string;
        fromUsername: string;
        fromAvatarUrl?: string;
        channelId: string;
    };
    onAccept: () => void;
    onReject: () => void;
}

export default function IncomingCallModal({ caller, onAccept, onReject }: Props) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#2b2d31] text-white p-6 rounded-lg shadow-lg w-80 flex flex-col items-center gap-4">
                <img
                    src={caller.fromAvatarUrl || '/default/vibic_avatar_1.svg'}
                    alt={caller.fromUsername}
                    className="w-16 h-16 rounded-full border-2 border-white"
                />
                <h2 className="text-xl font-bold">{caller.fromUsername}</h2>
                <p className="text-sm text-gray-400">Входящий звонок...</p>
                <div className="flex gap-4 mt-2">
                    <button
                        onClick={onAccept}
                        className="bg-green-500 hover:bg-green-600 p-3 rounded-full"
                    >
                        <Phone className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={onReject}
                        className="bg-red-500 hover:bg-red-600 p-3 rounded-full"
                    >
                        <PhoneOff className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}