import { useState, useEffect } from 'react';
import { Paperclip, Smile, Settings, Camera, Phone, Send } from 'lucide-react';
import { userProfilesApi } from '../api/userProfilesApi';
import UserProfileType from '../types/UserProfileType';
import DirectChannelType from '../types/DirectChannelType';
import { channelsApi } from '../api/channelsApi';
import { useAuth } from '../context/AuthContext';
import hubConnection from '../services/signalRClient';

interface DirectChatCenterPanelProps {
    channelId: string;
}

export default function DirectChatCenterPanel({ channelId }: DirectChatCenterPanelProps) {
    const currentUser = useAuth();
    const [memberUser, setMemberUser] = useState<UserProfileType>();
    const [, setChannel] = useState<DirectChannelType>();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // Загрузка информации о канале и другом пользователе
    useEffect(() => {
        const loadChannelAndUser = async () => {
            try {
                if (!currentUser) return;

                const channelResponse = await channelsApi.getDirectChannelById(channelId);
                const loadedChannel = channelResponse.data;
                setChannel(loadedChannel);

                const userId = loadedChannel.channelMembers.find(
                    (cm) => cm.userId !== currentUser.id
                )?.userId;

                if (!userId) {
                    console.warn('userId не найден');
                    return;
                }

                const userResponse = await userProfilesApi.getById(userId);
                setMemberUser(userResponse.data);
            } catch (error) {
                console.error('Ошибка загрузки канала или пользователя:', error);
            }
        };

        loadChannelAndUser();
    }, [channelId, currentUser]);

    // SignalR подключение
    useEffect(() => {
        const connect = async () => {
            try {
                if (hubConnection.state === 'Disconnected') {
                    await hubConnection.start();
                    console.log('✅ SignalR connected');
                }

                setIsConnected(true);

                // Подписка на входящие сообщения
                hubConnection.on('ReceiveMessage', (message) => {
                    console.log('📩 Новое сообщение:', message);
                    setMessages((prev) => [...prev, message]);
                });

                // Присоединение к группе
                await hubConnection.invoke('JoinChannel', channelId);
            } catch (err) {
                console.error('❌ Ошибка подключения SignalR:', err);
            }
        };

        connect();

        return () => {
            hubConnection.off('ReceiveMessage');
            hubConnection.stop();
        };
    }, [channelId]);

    // Отправка сообщения
    const handleSendMessage = async () => {
        if (!inputValue.trim() || !currentUser || !isConnected) return;

        try {
            await hubConnection.invoke('SendMessageToChannel', {
                channelId,
                senderId: currentUser.id,
                content: inputValue,
                senderUsername: currentUser.username,
                senderAvatarUrl: currentUser.avatarUrl,
            });

            setInputValue('');
        } catch (error) {
            console.error('❌ Ошибка отправки сообщения через SignalR:', error);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full bg-[#313338]">
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#1e1f22]">
                <div className="flex items-center gap-3">
                    {memberUser && (
                        <>
                            <img
                                src={memberUser.avatarUrl || '/default/vibic_avatar_1.svg'}
                                className="w-8 h-8 rounded-full"
                                alt={memberUser.username}
                            />
                            <span className="font-bold text-white text-lg">{memberUser.username}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-4 text-gray-300">
                    <Phone className="hover:text-white cursor-pointer w-5 h-5" />
                    <Camera className="hover:text-white cursor-pointer w-5 h-5" />
                    <Settings className="hover:text-white cursor-pointer w-5 h-5" />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id || msg.sentAt} className="flex items-start gap-3">
                        <img
                            src={msg.senderAvatarUrl || '/default/vibic_avatar_1.svg'}
                            className="w-8 h-8 rounded-full"
                            alt={msg.senderUsername}
                        />
                        <div>
                            <div className="text-sm font-semibold text-white">
                                {msg.senderUsername || 'Аноним'}
                                <span className="text-xs text-gray-400 ml-2">
                                    {new Date(msg.sentAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="text-sm text-gray-300 mt-1 whitespace-pre-line">
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="h-16 px-4 py-2 border-t border-[#1e1f22] flex items-center gap-3 bg-[#383a40]">
                <button>
                    <Paperclip className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
                <input
                    type="text"
                    placeholder={
                        memberUser ? `Написать @${memberUser.username}` : 'Загрузка...'
                    }
                    className="flex-1 bg-[#1e1f22] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400 outline-none"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                    }}
                />
                <button onClick={handleSendMessage} className="hover:text-white text-gray-400">
                    <Send className="w-5 h-5" />
                </button>
                <button>
                    <Smile className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
            </div>
        </div>
    );
}
