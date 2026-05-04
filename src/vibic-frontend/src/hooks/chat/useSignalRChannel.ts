import { useEffect, useRef, useState } from 'react';
import { chatHubConnection } from '../../services/signalRClient';
import { chatMessageBus } from '../../services/chatMessageBus';
import MessageResponse from '../../types/MessageType';
import SendMessageRequest from '../../types/signalR/sendMessageRequest';

export default function useSignalRChannel(
    channelId: string,
    onReceiveMessage: (message: MessageResponse) => void,
    onMessageDeleted?: (messageId: string) => void,
    onMessageEdited?: (message: MessageResponse) => void,
    onReactionUpdated?: (message: MessageResponse) => void,
) {
    const [connected, setConnected] = useState(false);
    const [typingUsername, setTypingUsername] = useState<string | null>(null);

    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onReceiveMessageRef = useRef(onReceiveMessage);
    const onMessageDeletedRef = useRef(onMessageDeleted);
    const onMessageEditedRef = useRef(onMessageEdited);
    const onReactionUpdatedRef = useRef(onReactionUpdated);

    useEffect(() => { onReceiveMessageRef.current = onReceiveMessage; }, [onReceiveMessage]);
    useEffect(() => { onMessageDeletedRef.current = onMessageDeleted; }, [onMessageDeleted]);
    useEffect(() => { onMessageEditedRef.current = onMessageEdited; }, [onMessageEdited]);
    useEffect(() => { onReactionUpdatedRef.current = onReactionUpdated; }, [onReactionUpdated]);

    useEffect(() => {
        const connect = async () => {
            try {
                setConnected(false);
                setTypingUsername(null);

                if (chatHubConnection.state === 'Disconnected') {
                    await chatHubConnection.start();
                    console.log('✅ SignalR connected');
                }

                // UserTyping is per-channel — managed directly on the hub
                chatHubConnection.off('UserTyping');
                chatHubConnection.on('UserTyping', (channelIdFromServer: string, username: string) => {
                    if (channelIdFromServer === channelId) {
                        setTypingUsername(username);
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => setTypingUsername(null), 500);
                    }
                });

                // Join channel — don't leave previous channel so background channels
                // stay subscribed for unread tracking
                await chatHubConnection.invoke('JoinChannel', channelId);
                console.log(`✅ Joined channel: ${channelId}`);
                setConnected(true);
            } catch (err) {
                setConnected(false);
                console.error('❌ SignalR error:', err);
            }
        };

        // Subscribe to the shared message bus (filtered by channelId)
        const unsubMsg = chatMessageBus.onMessage((msg) => {
            if (msg.channelId === channelId) {
                onReceiveMessageRef.current(msg);
            }
        });
        const unsubDeleted = chatMessageBus.onDeleted((payload) => {
            if (payload.channelId === channelId) {
                onMessageDeletedRef.current?.(payload.messageId);
            }
        });
        const unsubEdited = chatMessageBus.onEdited((msg) => {
            if (msg.channelId === channelId) {
                onMessageEditedRef.current?.(msg);
            }
        });
        const unsubReaction = chatMessageBus.onReactionUpdated((msg) => {
            if (msg.channelId === channelId) {
                onReactionUpdatedRef.current?.(msg);
            }
        });

        connect();

        return () => {
            unsubMsg();
            unsubDeleted();
            unsubEdited();
            unsubReaction();
            chatHubConnection.off('UserTyping');
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setConnected(false);
        };
    }, [channelId]);

    const sendMessage = async (message: SendMessageRequest) => {
        await chatHubConnection.invoke('SendMessageToChannel', message);
    };

    return { sendMessage, connected, typingUsername };
}
