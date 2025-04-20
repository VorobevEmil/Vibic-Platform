import { useEffect, useState } from 'react';
import { chatHubConnection } from '../services/signalRClient';

export default function useSignalRChannel(channelId: string) {
    const [messages, setMessages] = useState<any[]>([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const connect = async () => {
            try {
                if (chatHubConnection.state === 'Disconnected') {
                    await chatHubConnection.start();
                    console.log('✅ SignalR connected');
                }

                setConnected(true);

                chatHubConnection.on('ReceiveMessage', (msg) => {
                    setMessages(prev => [...prev, msg]);
                });

                await chatHubConnection.invoke('JoinChannel', channelId);
            } catch (err) {
                console.error('❌ SignalR error:', err);
            }
        };

        connect();

        return () => {
            chatHubConnection.off('ReceiveMessage');
            chatHubConnection.stop();
        };
    }, [channelId]);

    const sendMessage = async (message: any) => {
        await chatHubConnection.invoke('SendMessageToChannel', message);
    };

    return { messages, sendMessage, connected };
}