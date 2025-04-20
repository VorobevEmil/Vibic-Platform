import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { callHubConnection } from '../../services/signalRClient';
import CallRequestType from '../../types/CallUserRequestType';
import { rtcConfiguration } from '../../configs/webrtcConfig';

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

    setupPeerConnection(callRequest.targetUserId);

    const offer = await peerConnection.current!.createOffer();
    await peerConnection.current!.setLocalDescription(offer);

    await callHubConnection.invoke('SendOffer', {
      toUserId: callRequest.targetUserId,
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
      }

      callHubConnection.on('CallRejected', () => {
        closeCall();
      });

      callHubConnection.on('CallAccepted', () => {
        startCall();
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
    setIsCamOn(prev => !prev);
  };

  const closeCall = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    onClose();
  };

  return (
    <div className="w-full h-1/2 bg-black text-white flex flex-col justify-center items-center relative px-4">
      <div className="flex flex-row gap-4 justify-center items-center">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-[320px] h-[240px] rounded-lg border-2 border-white shadow-lg object-cover"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-[320px] h-[240px] rounded-lg border-2 border-green-500 shadow-lg object-cover"
        />
      </div>

      <div className="mt-6 flex gap-4">
        <button onClick={toggleMic} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600">
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button onClick={toggleCam} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600">
          {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button onClick={closeCall} className="p-3 bg-red-600 rounded-full hover:bg-red-500">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
