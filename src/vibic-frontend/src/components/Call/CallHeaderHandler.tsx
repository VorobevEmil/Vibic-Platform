import { useLocation, useNavigate } from "react-router-dom";
import CallRequestType from "../../types/CallRequestType";
import { useEffect, useState } from "react";
import useDirectChannel from "../../hooks/chat/useDirectChannel";
import { useAuthContext } from "../../context/AuthContext";
import { Phone, Settings, Video } from "lucide-react";
import CallPanel from "./CallPanel";

interface Props {
    channelId: string;
}

export default function CallHeaderHandler({ channelId }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { isIncomingCall?: boolean; callData?: CallRequestType; } | null;
    const { selfUser } = useAuthContext();
    const [isCalling, setIsCalling] = useState(false);
    const [callRequest, setCallRequest] = useState<CallRequestType | null>(null);
    const peerUser = useDirectChannel(
        {
            channelId: channelId,
            localUserId: selfUser?.id
        });

    const handleStartCall = (startWithCam: boolean) => {
        if (!peerUser || !selfUser) return;

        setCallRequest({
            peerUserId: peerUser.id,
            peerUsername: peerUser.username,
            peerAvatarUrl: peerUser.avatarUrl,
            initiatorUsername: selfUser.username,
            initiatorAvatarUrl: selfUser.avatarUrl,
            channelId,
            isInitiator: true,
            isCamOn: startWithCam,
        });

        setIsCalling(true);
    };

    useEffect(() => {
        if (state?.isIncomingCall && state.callData) {
            setIsCalling(true);
            setCallRequest(state.callData);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [state]);

    return (
        <div>
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#1e1f22]">
                <div className="flex items-center gap-3">
                    {peerUser && (
                        <>
                            <img src={peerUser.avatarUrl} className="w-8 h-8 rounded-full" />
                            <span className="font-bold text-white text-lg">{peerUser.displayName}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-4 text-gray-300">
                    <Phone className="hover:text-white cursor-pointer w-5 h-5" onClick={() => handleStartCall(false)} />
                    <Video className="hover:text-white cursor-pointer w-5 h-5" onClick={() => handleStartCall(true)} />
                    <Settings className="hover:text-white cursor-pointer w-5 h-5" />
                </div>
            </div>

            {isCalling && callRequest && (
                <CallPanel onClose={() => setIsCalling(false)} callRequest={callRequest} />
            )}
        </div>
    )
}