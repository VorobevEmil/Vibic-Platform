import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { callHubConnection } from '../../services/signalRClient';
import CallRequestType from '../../types/CallRequestType';
import { rtcConfiguration } from '../../configs/webrtcConfig';
import { useAuthContext } from '../../context/AuthContext';

interface CallPanelProps {
  onClose: () => void;
  callRequest: CallRequestType;
}

export default function CallPanel({ onClose, callRequest }: CallPanelProps) {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [remoteStreamStarted, setRemoteStreamStarted] = useState(false);
  const [isRemoteCamOn, setIsRemoteCamOn] = useState(true);
  const selfUser = useAuthContext();
  const remoteAvatarUrl = callRequest.isInitiator
    ? callRequest.peerAvatarUrl // для инициатора peer — это собеседник
    : callRequest.initiatorAvatarUrl; // для принявшего — инициатор его собеседник


  const setupPeerConnection = (remoteUserId: string) => {
    peerConnection.current = new RTCPeerConnection(rtcConfiguration);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, streamRef.current!);
      });
    }

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        if (!remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = new MediaStream();
        }
        const remoteStream = remoteVideoRef.current.srcObject as MediaStream;
        remoteStream.addTrack(event.track);

        setRemoteStreamStarted(true);
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        callHubConnection.invoke('SendIceCandidate', {
          toUserId: remoteUserId,
          candidate: event.candidate
        });
      }
    };
  };

  const startCall = async () => {
    if (!streamRef.current) return;

    setupPeerConnection(callRequest.peerUserId);

    const offer = await peerConnection.current!.createOffer();
    await peerConnection.current!.setLocalDescription(offer);

    await callHubConnection.invoke('SendOffer', {
      toUserId: callRequest.peerUserId,
      offer
    });
  };

  useEffect(() => {
    const start = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = userStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userStream;
        }
      } catch (err) {
        console.error('Ошибка доступа к камере/микрофону', err);
      }

      if (callHubConnection.state === 'Disconnected') {
        await callHubConnection.start();
        console.log('✅ CallPanel SignalR connected');
      }

      callHubConnection.on('CallRejected', () => {
        closeCall(false);
        console.log('📞 Звонок отклонен');
      });

      callHubConnection.on('CallAccepted', () => {
        startCall();
        console.log('📞 Звонок принят');
      });

      callHubConnection.on('CancelAcceptedCall', () => {
        closeCall(false);
        console.log('📞 Звонок завершен');
      });


      callHubConnection.on('PeerCameraStatusChanged', (isCamEnabled: boolean) => {
        setIsRemoteCamOn(isCamEnabled);
      });

      callHubConnection.on('ReceiveOffer', async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
        setupPeerConnection(fromUserId);

        await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current!.createAnswer();
        await peerConnection.current!.setLocalDescription(answer);

        await callHubConnection.invoke('SendAnswer', {
          toUserId: fromUserId,
          answer
        });
      });

      callHubConnection.on('ReceiveAnswer', async (answer: RTCSessionDescriptionInit) => {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        } 
      });

      callHubConnection.on('ReceiveIceCandidate', async (candidate: RTCIceCandidateInit) => {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      if (callRequest.isInitiator) {
        await callHubConnection.invoke('CallUser', callRequest);
      }
    };

    start();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      peerConnection.current?.close();
    };
  }, []);

  const toggleMic = () => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
    setIsMicOn(prev => !prev);
  };

  const toggleCam = () => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
    setIsCamOn(prev => {
      const newState = !prev;
      callHubConnection.invoke('NotifyCameraStatusChanged', {
        toUserId: callRequest.peerUserId,
        isCameraOn: newState
      });
      return newState;
    });
  };

  const closeCall = (cancelByUser: boolean) => {
    if (cancelByUser) {
      callHubConnection.invoke('CancelCall', callRequest.peerUserId, remoteStreamStarted);
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    onClose();
  };

  return (
    <div className="w-full h-1/2 bg-black text-white flex flex-col justify-center items-center relative px-4">
      <div className="flex flex-row gap-4 justify-center items-center">
        <div className="w-[320px] h-[240px] relative rounded-lg border-2 border-white shadow-lg bg-[#1e1f22]">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className={`w-full h-full rounded-lg object-cover ${isCamOn ? '' : 'hidden'}`}
          />

          {!isCamOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={selfUser?.avatarUrl}
                alt="avatar"
                className="w-20 h-20 rounded-full border-2 border-white"
              />
            </div>
          )}
        </div>

        <div className="w-[320px] h-[240px] relative rounded-lg border-2 border-green-500 shadow-lg bg-[#1e1f22]">
          <video
            ref={remoteVideoRef}
            autoPlay
            className={`w-full h-full rounded-lg object-cover ${isRemoteCamOn ? '' : 'hidden'}`}
          />

          {!remoteStreamStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1f22]">
              <img
                src={remoteAvatarUrl}
                alt="user-avatar"
                className="w-20 h-20 rounded-full border-2 border-white animate-pulse"
              />
              <span className="mt-2 text-sm text-gray-400 animate-pulse">
                Ожидание подключения...
              </span>
            </div>
          )}

          {remoteStreamStarted && !isRemoteCamOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={remoteAvatarUrl}
                alt="avatar"
                className="w-20 h-20 rounded-full border-2 border-white"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button onClick={toggleMic} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600">
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button onClick={toggleCam} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600">
          {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button onClick={() => closeCall(true)} className="p-3 bg-red-600 rounded-full hover:bg-red-500">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
