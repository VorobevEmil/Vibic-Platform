import { useEffect, useState } from 'react';
import { callHubConnection } from '../../services/signalRClient';
import IncomingCallModal from './IncomingCallModal';
import { useNavigate } from 'react-router-dom';


type IncomingCallData = {
    fromUserId: string;
    fromUsername: string;
    fromAvatarUrl?: string;
    channelId: string;
};

export default function CallListener() {
    const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const startListening = async () => {

            if (callHubConnection.state === 'Disconnected') {
                await callHubConnection.start();
                console.log('✅ Call SignalR connected');
            }

            callHubConnection.on('IncomingCall', (data: IncomingCallData) => {
                console.log('📞 Входящий звонок:', data);
                setIncomingCall(data);
            });
        }
        startListening();
    }, []);

    const handleAccept = async () => {
        if (!incomingCall) return;

        try {
            // 1. Уведомляем сервер, что звонок принят
            await callHubConnection.invoke('AcceptCall', incomingCall.fromUserId, incomingCall.channelId);

            // 2. Навигация + передача состояния
            navigate(`/channels/${incomingCall.channelId}`, {
                state: {
                    isIncomingCall: true,
                    callData: {
                        targetUserId: incomingCall.fromUserId,
                        fromUsername: incomingCall.fromUsername,
                        fromAvatarUrl: incomingCall.fromAvatarUrl,
                        channelId: incomingCall.channelId,
                    },
                },
            });

            // 3. Очистка состояния входящего вызова
            setIncomingCall(null);
        } catch (err) {
            console.error('Ошибка принятия вызова:', err);
        }
    };

    const handleReject = async () => {
        if (!incomingCall) return;

        await callHubConnection.invoke('RejectCall', incomingCall.fromUserId);
        setIncomingCall(null);
    };

    return (
        <>
            {incomingCall && (
                <IncomingCallModal
                    caller={incomingCall}
                    onAccept={handleAccept}
                    onReject={handleReject}
                />
            )}
        </>
    );
}