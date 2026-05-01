import { useEffect, useState } from 'react';
import { callHubConnection } from '../../services/signalRClient';
import IncomingCallModal from './IncomingCallModal';
import { useNavigate } from 'react-router-dom';
import IncomingCallType from '../../types/IncomingCallType';
import CallRequestType from '../../types/CallRequestType';
import { useCallContext } from '../../context/CallContext';
import { useVoice } from '../../context/VoiceContext';


export default function CallListener() {
    const [incomingCall, setIncomingCall] = useState<IncomingCallType | null>(null);
    const navigate = useNavigate();
    const { startDirectCall } = useCallContext();
    const { activeVoiceSession, leaveChannel } = useVoice();

    useEffect(() => {
        const startListening = async () => {

            if (callHubConnection.state === 'Disconnected') {
                await callHubConnection.start();
                console.log('✅ CallListener SignalR connected');
            }

            callHubConnection.on('IncomingCall', (data: CallRequestType) => {
                console.log('📞 Входящий звонок:', data);
                setIncomingCall(data);
            });

            callHubConnection.on('CancelIncomingCall', () => {
                console.log('📞 Звонок отменен');
                setIncomingCall(null);
            });
        }
        startListening();

        return () => {
            callHubConnection.off('IncomingCall');
            callHubConnection.off('CancelIncomingCall');
        };
    }, []);

    const handleAccept = async () => {
        if (!incomingCall) return;

        try {
            const callData: CallRequestType = {
                ...incomingCall,
                isInitiator: false,
            };

            if (activeVoiceSession) {
                await leaveChannel();
            }

            startDirectCall(callData);

            navigate(`/channels/@me/${incomingCall.channelId}`, {
                replace: false,
            });

            setIncomingCall(null);
        } catch (err) {
            console.error('Ошибка принятия вызова:', err);
        }
    };

    const handleReject = async () => {
        if (!incomingCall) return;

        await callHubConnection.invoke('RejectCall', incomingCall.peerUserId);
        setIncomingCall(null);
    };

    return (
        <>
            {incomingCall && (
                <IncomingCallModal
                    callInfo={incomingCall}
                    onAccept={handleAccept}
                    onReject={handleReject}
                />
            )}
        </>
    );
}
