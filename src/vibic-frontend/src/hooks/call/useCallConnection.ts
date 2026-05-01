import { useCallback, useEffect, useRef, useState } from 'react';
import { callHubConnection } from '../../services/signalRClient';
import { rtcConfiguration } from '../../utils/webrtcConfig';
import CallRequestType from '../../types/CallRequestType';
import { useMedia } from '../../context/MediaContext';

interface UseCallConnectionProps {
    callRequest: CallRequestType;
    onClose: () => void;
}

export default function useCallConnection({
    callRequest,
    onClose,
}: UseCallConnectionProps) {
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const localVideoElementRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoElementRef = useRef<HTMLVideoElement | null>(null);
    const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const remoteStreamStartedRef = useRef(false);
    const isClosingRef = useRef(false);
    const peerUserId = callRequest.peerUserId;

    const [isCamOn, setIsCamOn] = useState(callRequest.isCamOn ?? true);
    const { isMicOn, isHeadphonesOn } = useMedia();
    const [remoteStreamStarted, setRemoteStreamStarted] = useState(false);
    const [isRemoteCamOn, setIsRemoteCamOn] = useState(false);
    const [isRemoteMicOn, setIsRemoteMicOn] = useState(true);

    const attachLocalStreamToElement = useCallback((element: HTMLVideoElement | null) => {
        localVideoElementRef.current = element;

        if (!element) {
            return;
        }

        element.srcObject = streamRef.current;
        element.muted = true;
    }, []);

    const attachRemoteStreamToElement = useCallback((element: HTMLVideoElement | null) => {
        remoteVideoElementRef.current = element;

        if (!element) {
            return;
        }

        element.srcObject = remoteStreamRef.current;
        element.muted = !isHeadphonesOn;
    }, [isHeadphonesOn]);

    const resetRemoteStream = () => {
        remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
        remoteStreamRef.current = null;
        remoteStreamStartedRef.current = false;
        setRemoteStreamStarted(false);

        if (remoteVideoElementRef.current) {
            remoteVideoElementRef.current.srcObject = null;
        }
    };

    const flushPendingIceCandidates = async () => {
        const pc = peerConnection.current;
        if (!pc || pc.signalingState === 'closed' || !pc.remoteDescription) {
            return;
        }

        const pendingCandidates = pendingIceCandidatesRef.current.splice(0);
        for (const candidate of pendingCandidates) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.warn('Failed to add queued ICE candidate', error);
            }
        }
    };

    const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
        const pc = peerConnection.current;
        if (!pc || pc.signalingState === 'closed' || !pc.remoteDescription) {
            pendingIceCandidatesRef.current.push(candidate);
            return;
        }

        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.warn('Failed to add ICE candidate', error);
        }
    };

    const setupPeerConnection = (remoteUserId: string, clearQueuedCandidates = false) => {
        peerConnection.current?.close();
        resetRemoteStream();

        if (clearQueuedCandidates) {
            pendingIceCandidatesRef.current = [];
        }

        peerConnection.current = new RTCPeerConnection(rtcConfiguration);

        streamRef.current?.getTracks().forEach((track) => {
            peerConnection.current?.addTrack(track, streamRef.current!);
        });

        peerConnection.current!.ontrack = (event) => {
            if (!remoteStreamRef.current) {
                remoteStreamRef.current = new MediaStream();
            }

            if (!remoteStreamRef.current.getTracks().some((track) => track.id === event.track.id)) {
                remoteStreamRef.current.addTrack(event.track);
            }

            if (remoteVideoElementRef.current) {
                remoteVideoElementRef.current.srcObject = remoteStreamRef.current;
                remoteVideoElementRef.current.muted = !isHeadphonesOn;
            }

            remoteStreamStartedRef.current = true;
            setRemoteStreamStarted(true);
        };

        peerConnection.current!.onicecandidate = (event) => {
            if (event.candidate) {
                callHubConnection.invoke('SendIceCandidate', {
                    toUserId: remoteUserId,
                    candidate: event.candidate,
                    scope: 'direct',
                }).catch(console.error);
            }
        };
    };

    const startCall = async () => {
        if (isClosingRef.current) {
            return;
        }

        setupPeerConnection(peerUserId, true);

        const offer = await peerConnection.current!.createOffer();
        await peerConnection.current!.setLocalDescription(offer);

        await callHubConnection.invoke('SendOffer', {
            toUserId: peerUserId,
            offer,
            scope: 'direct',
        });

        callHubConnection.invoke('NotifyCameraStatusChanged', peerUserId, isCamOn).catch(console.error);
        callHubConnection.invoke('NotifyMicStatusChanged', peerUserId, isMicOn).catch(console.error);
    };

    const closeCall = (byUser: boolean) => {
        if (isClosingRef.current) {
            return;
        }

        isClosingRef.current = true;

        if (byUser) {
            callHubConnection.invoke('CancelCall', peerUserId, remoteStreamStartedRef.current).catch(console.error);
        }

        peerConnection.current?.close();
        peerConnection.current = null;
        pendingIceCandidatesRef.current = [];

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        resetRemoteStream();

        if (localVideoElementRef.current) localVideoElementRef.current.srcObject = null;

        onClose();
    };

    const toggleCam = () => {
        streamRef.current?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
        setIsCamOn((prev) => {
            const newState = !prev;
            callHubConnection.invoke('NotifyCameraStatusChanged', peerUserId, newState).catch(console.error);
            return newState;
        });
    };

    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = isCamOn;
            });

            callHubConnection.invoke('NotifyCameraStatusChanged', peerUserId, isCamOn).catch(console.error);
        }
    }, [isCamOn, peerUserId]);


    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = isMicOn;
            });

            callHubConnection.invoke('NotifyMicStatusChanged', peerUserId, isMicOn).catch(console.error);
        }
    }, [isMicOn, peerUserId]);

    useEffect(() => {
        if (remoteVideoElementRef.current) {
            remoteVideoElementRef.current.muted = !isHeadphonesOn;
        }
    }, [isHeadphonesOn]);


    useEffect(() => {
        type CallHubHandler = (...args: unknown[]) => void | Promise<void>;

        const handlers: Array<[string, CallHubHandler]> = [
            ['CallRejected', () => closeCall(false)],
            ['CallAccepted', () => { void startCall().catch((error) => {
                console.error('Failed to start direct call', error);
                closeCall(false);
            }); }],
            ['CancelAcceptedCall', () => closeCall(false)],
            ['PeerCameraStatusChanged', (isCam) => setIsRemoteCamOn(Boolean(isCam))],
            ['PeerMicStatusChanged', (isMic) => setIsRemoteMicOn(Boolean(isMic))],
            ['ReceiveOffer', async (fromUserId, offer) => {
                if (typeof fromUserId !== 'string') {
                    return;
                }

                try {
                    setupPeerConnection(fromUserId);
                    await peerConnection.current!.setRemoteDescription(
                        new RTCSessionDescription(offer as RTCSessionDescriptionInit)
                    );
                    await flushPendingIceCandidates();
                    const answer = await peerConnection.current!.createAnswer();
                    await peerConnection.current!.setLocalDescription(answer);

                    await callHubConnection.invoke('SendAnswer', {
                        toUserId: fromUserId,
                        answer,
                        scope: 'direct',
                    });
                } catch (error) {
                    console.error('Failed to handle direct call offer', error);
                    closeCall(false);
                }
            }],
            ['ReceiveAnswer', async (_fromUserId, answer) => {
                const pc = peerConnection.current;
                if (!pc || pc.signalingState === 'closed') {
                    return;
                }

                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer as RTCSessionDescriptionInit));
                    await flushPendingIceCandidates();
                } catch (error) {
                    console.warn('Failed to handle direct call answer', error);
                }
            }],
            ['ReceiveIceCandidate', async (_fromUserId, candidate) => {
                await addIceCandidate(candidate as RTCIceCandidateInit);
            }],
        ];

        let isDisposed = false;

        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (isDisposed) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (localVideoElementRef.current) {
                    localVideoElementRef.current.srcObject = stream;
                    localVideoElementRef.current.muted = true;
                }

                stream.getAudioTracks().forEach((track) => (track.enabled = isMicOn));
                stream.getVideoTracks().forEach((track) => (track.enabled = isCamOn));

                if (callHubConnection.state === 'Disconnected') {
                    await callHubConnection.start();
                }

                if (isDisposed) {
                    return;
                }

                for (const [event, handler] of handlers) {
                    callHubConnection.on(event, handler);
                }

                if (isDisposed) {
                    return;
                }

                if (callRequest.isInitiator) {
                    await callHubConnection.invoke('CallUser', callRequest);
                } else {
                    await callHubConnection.invoke('AcceptCall', peerUserId, callRequest.channelId);
                    callHubConnection.invoke('NotifyCameraStatusChanged', peerUserId, isCamOn).catch(console.error);
                    callHubConnection.invoke('NotifyMicStatusChanged', peerUserId, isMicOn).catch(console.error);
                }
            } catch (error) {
                console.error('Failed to initialize direct call media/signaling', error);
                if (!isDisposed) {
                    closeCall(false);
                }
            }
        };

        void init();

        return () => {
            isDisposed = true;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
            peerConnection.current?.close();
            peerConnection.current = null;
            remoteStreamRef.current = null;
            pendingIceCandidatesRef.current = [];
            remoteStreamStartedRef.current = false;

            for (const [event, handler] of handlers) {
                callHubConnection.off(event, handler);
            }
        };
    // This effect owns a single call session. Re-running it on media toggles would recreate
    // tracks and SDP handlers mid-call, so the session captures the initial call request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        localVideoRef: attachLocalStreamToElement,
        remoteVideoRef: attachRemoteStreamToElement,
        isCamOn,
        isMicOn,
        isRemoteCamOn,
        isRemoteMicOn,
        remoteStreamStarted,
        toggleCam,
        closeCall,
    };
}
