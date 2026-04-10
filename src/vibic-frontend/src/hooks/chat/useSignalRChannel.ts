import { useEffect, useRef, useState } from 'react';
import { chatHubConnection } from '../../services/signalRClient';
import MessageResponse from '../../types/MessageType';
import SendMessageRequest from '../../types/signalR/sendMessageRequest';

export default function useSignalRChannel(
    channelId: string,
    onReceiveMessage: (message: MessageResponse) => void,
    onMessageDeleted?: (messageId: string) => void,
    onMessageEdited?: (message: MessageResponse) => void,
) {
    const [connected, setConnected] = useState(false);
    const [typingUsername, setTypingUsername] = useState<string | null>(null);

    const prevChannelIdRef = useRef<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onReceiveMessageRef = useRef(onReceiveMessage);
    const onMessageDeletedRef = useRef(onMessageDeleted);
    const onMessageEditedRef = useRef(onMessageEdited);

    useEffect(() => { onReceiveMessageRef.current = onReceiveMessage; }, [onReceiveMessage]);
    useEffect(() => { onMessageDeletedRef.current = onMessageDeleted; }, [onMessageDeleted]);
    useEffect(() => { onMessageEditedRef.current = onMessageEdited; }, [onMessageEdited]);

    useEffect(() => {
        const connect = async () => {
            try {
                setConnected(false);
                setTypingUsername(null);

                if (chatHubConnection.state === 'Disconnected') {
                    await chatHubConnection.start();
                    console.log('✅ SignalR connected');
                }

                chatHubConnection.off('ReceiveMessage');
                chatHubConnection.off('UserTyping');
                chatHubConnection.off('MessageDeleted');
                chatHubConnection.off('MessageEdited');

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

                chatHubConnection.on('MessageDeleted', (payload: { messageId: string; channelId: string }) => {
                    if (payload.channelId === channelId) onMessageDeletedRef.current?.(payload.messageId);
                });

                chatHubConnection.on('MessageEdited', (message: MessageResponse) => {
                    if (message.channelId === channelId) onMessageEditedRef.current?.(message);
                });

                if (prevChannelIdRef.current && prevChannelIdRef.current !== channelId) {
                    await chatHubConnection.invoke('LeaveChannel', prevChannelIdRef.current);
                    console.log(`🚪 Left channel: ${prevChannelIdRef.current}`);
                }

                await chatHubConnection.invoke('JoinChannel', channelId);
                console.log(`✅ Joined channel: ${channelId}`);
                prevChannelIdRef.current = channelId;
                setConnected(true);
            } catch (err) {
                setConnected(false);
                console.error('❌ SignalR error:', err);
            }
        };

        connect();

        return () => {
            chatHubConnection.off('ReceiveMessage');
            chatHubConnection.off('UserTyping');
            chatHubConnection.off('MessageDeleted');
            chatHubConnection.off('MessageEdited');

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setConnected(false);
        };
    }, [channelId]);

    const sendMessage = async (message: SendMessageRequest) => {
        await chatHubConnection.invoke('SendMessageToChannel', message);
    };

    return { sendMessage, connected, typingUsername };
}
