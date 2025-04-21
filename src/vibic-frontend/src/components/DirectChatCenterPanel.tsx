import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paperclip, Smile, Settings, Camera, Phone, Send } from 'lucide-react';
import useDirectChannel from '../hooks/useDirectChannel';
import useSignalRChannel from '../hooks/useSignalRChannel';
import { useAuthContext } from '../context/AuthContext';
import CallPanel from './Call/CallPanel';
import CallRequestType from '../types/CallRequestType';
import { chatHubConnection } from '../services/signalRClient';
import { messagesApi } from '../api/messagesApi';
import MessageType from '../types/MessageType';

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

    const selfUser = useAuthContext();
    const [inputValue, setInputValue] = useState('');
    const [isCalling, setIsCalling] = useState(false);
    const [callRequest, setCallRequest] = useState<CallRequestType | null>(null);
    const peerUser = useDirectChannel(channelId, selfUser?.id);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const { sendMessage, connected, typingUsername } = useSignalRChannel(channelId, setMessages);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handleStartCall = () => {
        if (!peerUser || !selfUser) return;

        const updatedRequest: CallRequestType = {
            peerUserId: peerUser.id,
            peerUsername: peerUser.username,
            peerAvatarUrl: peerUser.avatarUrl,
            initiatorUsername: selfUser.username,
            initiatorAvatarUrl: selfUser.avatarUrl,
            channelId,
            isInitiator: true,
        };

        setCallRequest(updatedRequest);
        setIsCalling(true);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || !connected || !selfUser) return;

        await sendMessage({
            channelId,
            content: inputValue,
        });

        setInputValue('');

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    const handleTyping = () => {
        if (chatHubConnection.state === 'Connected' && selfUser?.username) {
            chatHubConnection.invoke('SendTypingStatus', channelId, selfUser.username);
        }
    };

    useEffect(() => {
        const initializeMessages = async () => {

            const response = await messagesApi.getMessagesByChannelId(channelId);

            setMessages(response.data);
        }

        initializeMessages();
    }, [])

    useEffect(() => {
        if (!peerUser || !selfUser) return;

        const updateCallRequest: CallRequestType = {
            peerUserId: peerUser.id,
            peerUsername: peerUser.username,
            peerAvatarUrl: peerUser.avatarUrl,
            initiatorUsername: selfUser.username,
            initiatorAvatarUrl: selfUser.avatarUrl,
            channelId,
            isInitiator: true,
        };

        setCallRequest(updateCallRequest);
    }, [selfUser, peerUser]);

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
                    {peerUser && (
                        <>
                            <img src={peerUser.avatarUrl} className="w-8 h-8 rounded-full" />
                            <span className="font-bold text-white text-lg">{peerUser.username}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-4 text-gray-300">
                    <Phone className="hover:text-white cursor-pointer w-5 h-5" onClick={handleStartCall} />
                    <Camera className="hover:text-white cursor-pointer w-5 h-5" onClick={handleStartCall} />
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
                    <div key={msg.id} className="flex items-start gap-3">
                        <img src={msg.senderAvatarUrl} className="w-8 h-8 rounded-full" />
                        <div>
                            <div className="text-sm font-semibold text-white">
                                {msg.senderUsername}
                                <span className="text-xs text-gray-400 ml-2">
                                    {new Date(msg.sentAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="text-sm text-gray-300 mt-1 whitespace-pre-line">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {typingUsername && (
                    <div className="text-sm text-gray-400 mt-2 ml-2 animate-pulse">
                        {typingUsername} печатает...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="h-16 px-4 py-2 border-t border-[#1e1f22] flex items-center gap-3 bg-[#383a40]">
                <button><Paperclip className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                <input
                    type="text"
                    placeholder={peerUser ? `Написать @${peerUser.username}` : 'Загрузка...'}
                    className="flex-1 bg-[#1e1f22] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400 outline-none"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        handleTyping();
                    }}
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
