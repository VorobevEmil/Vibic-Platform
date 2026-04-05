import { useEffect, useRef, useState } from 'react';
import { chatHubConnection } from '../../services/signalRClient';
import MessageResponse from '../../types/MessageType';
import SendMessageRequest from '../../types/signalR/sendMessageRequest';

export default function useSignalRChannel(
    channelId: string,
    onReceiveMessage: (message: MessageResponse) => void
) {
    const [connected, setConnected] = useState(false);
    const [typingUsername, setTypingUsername] = useState<string | null>(null);

    const prevChannelIdRef = useRef<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onReceiveMessageRef = useRef(onReceiveMessage);

    useEffect(() => {
        onReceiveMessageRef.current = onReceiveMessage;
    }, [onReceiveMessage]);

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

                chatHubConnection.on('ReceiveMessage', (msg: MessageResponse) => {
                    onReceiveMessageRef.current(msg);
                });

                chatHubConnection.on('UserTyping', (channelIdFromServer, username) => {
                    if (channelIdFromServer === channelId) {
                        setTypingUsername(username);

                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => setTypingUsername(null), 500);
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

    const sendMessage = async (message: SendMessageRequest) => {
        await chatHubConnection.invoke('SendMessageToChannel', message);
    };

    return { sendMessage, connected, typingUsername };
}
