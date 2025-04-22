import { useEffect, useState, useRef } from 'react';
import { chatHubConnection } from '../services/signalRClient';
import MessageType from '../types/MessageType';

export default function useSignalRChannel(
    channelId: string,
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>
) {
    const [connected, setConnected] = useState(false);
    const [typingUsername, setTypingUsername] = useState<string | null>(null);

    const prevChannelIdRef = useRef<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const connect = async () => {
            try {
                setTypingUsername(null);

                if (chatHubConnection.state === 'Disconnected') {
                    await chatHubConnection.start();
                    console.log('✅ SignalR connected');
                }

                setConnected(true);

                chatHubConnection.off('ReceiveMessage');
                chatHubConnection.off('UserTyping');

                chatHubConnection.on('ReceiveMessage', (msg: MessageType) => {
                    setMessages(prev => [...prev, msg]);
                });

                chatHubConnection.on('UserTyping', (channelIdFromServer, username) => {
                    if (channelIdFromServer === channelId) {
                        setTypingUsername(username);

                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => setTypingUsername(null), 1000);
                    }
                });

                if (prevChannelIdRef.current && prevChannelIdRef.current !== channelId) {
                    await chatHubConnection.invoke('LeaveChannel', prevChannelIdRef.current);
                    console.log(`🚪 Left channel: ${prevChannelIdRef.current}`);
                }

                await chatHubConnection.invoke('JoinChannel', channelId);
                console.log(`✅ Joined channel: ${channelId}`);
                prevChannelIdRef.current = channelId;
            } catch (err) {
                console.error('❌ SignalR error:', err);
            }
        };

        connect();

        return () => {
            chatHubConnection.off('ReceiveMessage');
            chatHubConnection.off('UserTyping');

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [channelId]);

    const sendMessage = async (message: any) => {
        await chatHubConnection.invoke('SendMessageToChannel', message);
    };

    return { sendMessage, connected, typingUsername };
}