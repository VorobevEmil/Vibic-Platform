import { useEffect, useRef, useState } from 'react';
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
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isCamOn, setIsCamOn] = useState(callRequest.isCamOn ?? true);
    const { isMicOn } = useMedia();
    const [remoteStreamStarted, setRemoteStreamStarted] = useState(false);
    const [isRemoteCamOn, setIsRemoteCamOn] = useState(false);
    const [isRemoteMicOn, setIsRemoteMicOn] = useState(true);

    const setupPeerConnection = (remoteUserId: string) => {
        peerConnection.current = new RTCPeerConnection(rtcConfiguration);

        streamRef.current?.getTracks().forEach((track) => {
            peerConnection.current?.addTrack(track, streamRef.current!);
        });

        peerConnection.current!.ontrack = (event) => {
            if (!remoteVideoRef.current) return;
            if (!remoteVideoRef.current.srcObject) {
                remoteVideoRef.current.srcObject = new MediaStream();
            }

            const remoteStream = remoteVideoRef.current.srcObject as MediaStream;
            remoteStream.addTrack(event.track);
            setRemoteStreamStarted(true);
        };

        peerConnection.current!.onicecandidate = (event) => {
            if (event.candidate) {
                callHubConnection.invoke('SendIceCandidate', {
                    toUserId: remoteUserId,
                    candidate: event.candidate,
                });
            }
        };
    };

    const startCall = async () => {
        setupPeerConnection(callRequest.peerUserId);

        const offer = await peerConnection.current!.createOffer();
        await peerConnection.current!.setLocalDescription(offer);

        await callHubConnection.invoke('SendOffer', {
            toUserId: callRequest.peerUserId,
            offer,
        });

        callHubConnection.invoke('NotifyCameraStatusChanged', callRequest.peerUserId, isCamOn);
        callHubConnection.invoke('NotifyMicStatusChanged', callRequest.peerUserId, isMicOn);
    };

    const closeCall = (byUser: boolean) => {
        if (byUser) {
            callHubConnection.invoke('CancelCall', callRequest.peerUserId, remoteStreamStarted);
        }

        peerConnection.current?.close();
        peerConnection.current = null;

        streamRef.current?.getTracks().forEach((track) => track.stop());

        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

        onClose();
    };

    const toggleCam = () => {
        streamRef.current?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
        setIsCamOn((prev) => {
            const newState = !prev;
            callHubConnection.invoke('NotifyCameraStatusChanged', callRequest.peerUserId, newState);
            return newState;
        });
    };

    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = isCamOn;
            });

            callHubConnection.invoke('NotifyCameraStatusChanged', callRequest.peerUserId, isCamOn);
        }
    }, [isCamOn]);


    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = isMicOn;
            });

            callHubConnection.invoke('NotifyMicStatusChanged', callRequest.peerUserId, isMicOn);
        }
    }, [isMicOn]);


    useEffect(() => {
        const init = async () => {
            console.log(navigator.mediaDevices)

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            stream.getAudioTracks().forEach((track) => (track.enabled = isMicOn));
            stream.getVideoTracks().forEach((track) => (track.enabled = isCamOn));

            if (callHubConnection.state === 'Disconnected') {
                await callHubConnection.start();
            }

            const handlers = {
                CallRejected: () => closeCall(false),
                CallAccepted: () => startCall(),
                CancelAcceptedCall: () => closeCall(false),
                PeerCameraStatusChanged: (isCam: boolean) => setIsRemoteCamOn(isCam),
                PeerMicStatusChanged: (isMic: boolean) => setIsRemoteMicOn(isMic),

                ReceiveOffer: async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
                    setupPeerConnection(fromUserId);
                    await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await peerConnection.current!.createAnswer();
                    await peerConnection.current!.setLocalDescription(answer);

                    await callHubConnection.invoke('SendAnswer', {
                        toUserId: fromUserId,
                        answer,
                    });
                },

                ReceiveAnswer: async (answer: RTCSessionDescriptionInit) => {
                    await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
                },

                ReceiveIceCandidate: async (candidate: RTCIceCandidateInit) => {
                    if (peerConnection.current) {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                },
            };

            for (const [event, handler] of Object.entries(handlers)) {
                callHubConnection.off(event);
                callHubConnection.on(event, handler as any);
            }

            if (callRequest.isInitiator) {
                await callHubConnection.invoke('CallUser', callRequest);
            } else {
                await callHubConnection.invoke('AcceptCall', callRequest.peerUserId, callRequest.channelId);
                callHubConnection.invoke('NotifyCameraStatusChanged', callRequest.peerUserId, isCamOn);
                callHubConnection.invoke('NotifyMicStatusChanged', callRequest.peerUserId, isMicOn);
            }
        };

        init();

        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            peerConnection.current?.close();
            peerConnection.current = null;
        };
    }, []);

    return {
        localVideoRef,
        remoteVideoRef,
        isCamOn,
        isMicOn,
        isRemoteCamOn,
        isRemoteMicOn,
        remoteStreamStarted,
        toggleCam,
        closeCall,
    };
}
