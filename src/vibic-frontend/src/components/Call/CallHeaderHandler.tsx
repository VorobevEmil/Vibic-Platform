import { useLocation, useNavigate } from "react-router-dom";
import CallRequestType from "../../types/CallRequestType";
import { useEffect, useState } from "react";
import useDirectChannel from "../../hooks/chat/useDirectChannel";
import { useAuthContext } from "../../context/AuthContext";
import { Phone, Settings, Video } from "lucide-react";
import CallPanel from "./CallPanel";
import { useCallContext } from "../../context/CallContext";
import { resolveAssetUrl } from "../../api/httpClient";
import Skeleton from "../ui/Skeleton";

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
    const { setCallActive } = useCallContext();
    const { peerUser, isLoading } = useDirectChannel(
        {
            channelId: channelId,
            localUserId: selfUser?.id
        });

    const handleStartCall = (startWithCam: boolean) => {
        if (!peerUser || !selfUser) return;

        setCallRequest({
            peerUserId: peerUser.id,
            peerUsername: peerUser.username,
            peerAvatarUrl: resolveAssetUrl(peerUser.avatarUrl) ?? peerUser.avatarUrl,
            initiatorUsername: selfUser.username,
            initiatorAvatarUrl: resolveAssetUrl(selfUser.avatarUrl) ?? selfUser.avatarUrl,
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

    useEffect(() => {
        setCallActive(isCalling);
    }, [isCalling, setCallActive]);

    return (
        <div>
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#1e1f22]">
                <div className="flex items-center gap-3">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-5 w-32 rounded-lg" />
                        </>
                    ) : peerUser ? (
                        <>
                            <img src={resolveAssetUrl(peerUser.avatarUrl)} className="w-8 h-8 rounded-full" />
                            <span className="font-bold text-white text-lg">{peerUser.displayName}</span>
                        </>
                    ) : null}
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
