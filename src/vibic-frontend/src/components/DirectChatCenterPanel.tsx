import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paperclip, Smile, Settings, Camera, Phone, Send } from 'lucide-react';
import useDirectChannel from '../hooks/useDirectChannel';
import useSignalRChannel from '../hooks/useSignalRChannel';
import { useAuth } from '../context/AuthContext';
import CallPanel from './Call/CallPanel';
import CallRequestType from '../types/CallUserRequestType';

interface Props {
    channelId: string;
}

export default function DirectChatCenterPanel({ channelId }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as {
      isIncomingCall?: boolean;
      callData?: CallRequestType;
    } | null;
    
    const currentUser = useAuth();
    const [inputValue, setInputValue] = useState('');
    const [isCalling, setIsCalling] = useState(false);
    const [callRequest, setCallRequest] = useState<CallRequestType | null>(null);

    const { memberUser } = useDirectChannel(channelId, currentUser?.id);
    const { messages, sendMessage, connected } = useSignalRChannel(channelId);

    const handleSend = async () => {
        if (!inputValue.trim() || !connected || !currentUser) return;

        await sendMessage({
            channelId,
            senderId: currentUser.id,
            content: inputValue,
            senderUsername: currentUser.username,
            senderAvatarUrl: currentUser.avatarUrl,
        });

        setInputValue('');
    };

    useEffect(() => {
        if (!memberUser || !currentUser) return;

        const updateCallRequest: CallRequestType = {
            targetUserId: memberUser.id,
            fromUsername: currentUser.username,
            fromAvatarUrl: currentUser.avatarUrl,
            channelId: channelId,
            isInitiator: true
        };

        setCallRequest(updateCallRequest);
    }, [currentUser, memberUser]);

    useEffect(() => {
        if (state && state.isIncomingCall && state.callData) {
            setIsCalling(true);
            setCallRequest(state.callData);

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [state]);

    return (
        <div className="relative flex flex-col flex-1 h-full bg-[#313338]">
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#1e1f22]">
                <div className="flex items-center gap-3">
                    {memberUser && (
                        <>
                            <img src={memberUser.avatarUrl} className="w-8 h-8 rounded-full" />
                            <span className="font-bold text-white text-lg">{memberUser.username}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-4 text-gray-300">
                    <Phone className="hover:text-white cursor-pointer w-5 h-5" onClick={() => setIsCalling(true)} />
                    <Camera className="hover:text-white cursor-pointer w-5 h-5" />
                    <Settings className="hover:text-white cursor-pointer w-5 h-5" />
                </div>
            </div>

            {/* Call Panel */}
            {isCalling && callRequest && (
                <CallPanel onClose={() => setIsCalling(false)} callRequest={callRequest} />
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id || msg.sentAt} className="flex items-start gap-3">
                        <img src={msg.senderAvatarUrl} className="w-8 h-8 rounded-full" />
                        <div>
                            <div className="text-sm font-semibold text-white">
                                {msg.senderUsername}
                                <span className="text-xs text-gray-400 ml-2">{new Date(msg.sentAt).toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-gray-300 mt-1 whitespace-pre-line">{msg.content}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-16 px-4 py-2 border-t border-[#1e1f22] flex items-center gap-3 bg-[#383a40]">
                <button><Paperclip className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                <input
                    type="text"
                    placeholder={memberUser ? `Написать @${memberUser.username}` : 'Загрузка...'}
                    className="flex-1 bg-[#1e1f22] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400 outline-none"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} className="hover:text-white text-gray-400">
                    <Send className="w-5 h-5" />
                </button>
                <button><Smile className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            </div>
        </div>
    );
}
