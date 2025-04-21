import { useEffect, useState } from 'react';
import { chatHubConnection } from '../services/signalRClient';
import MessageType from '../types/MessageType';

export default function useSignalRChannel(channelId: string, setMessages : React.Dispatch<React.SetStateAction<MessageType[]>>) {
    const [connected, setConnected] = useState(false);

    const [typingUsername, setTypingUsername] = useState<string | null>(null);

    useEffect(() => {
        let typingTimeout: ReturnType<typeof setTimeout> 

        const connect = async () => {
            try {
                if (chatHubConnection.state === 'Disconnected') {
                    await chatHubConnection.start();
                    console.log('✅ SignalR connected');
                }

                setConnected(true);

                chatHubConnection.on('ReceiveMessage', (msg : MessageType) => {
                    setMessages(prev => [...prev, msg]);
                });

                chatHubConnection.on('UserTyping', (channelIdFromServer, username) => {
                    if (channelIdFromServer === channelId) {
                        setTypingUsername(username);

                        if (typingTimeout) clearTimeout(typingTimeout);
                        typingTimeout = setTimeout(() => setTypingUsername(null), 3000);
                    }
                });

                await chatHubConnection.invoke('JoinChannel', channelId);
            } catch (err) {
                console.error('❌ SignalR error:', err);
            }
        };

        connect();

        return () => {
            chatHubConnection.off('ReceiveMessage');
            chatHubConnection.off('UserTyping');
            chatHubConnection.stop();
            clearTimeout(typingTimeout);
        };
    }, [channelId]);

    const sendMessage = async (message: any) => {
        await chatHubConnection.invoke('SendMessageToChannel', message);
    };

    return { sendMessage, connected, typingUsername };
}