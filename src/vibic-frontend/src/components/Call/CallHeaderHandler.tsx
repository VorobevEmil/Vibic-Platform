import { useMemo } from "react";
import useDirectChannel from "../../hooks/chat/useDirectChannel";
import { useAuthContext } from "../../context/AuthContext";
import { Phone, Settings, Video } from "lucide-react";
import { useCallContext } from "../../context/CallContext";
import { resolveAssetUrl } from "../../api/httpClient";
import Skeleton from "../ui/Skeleton";

interface Props {
    channelId: string;
}

export default function CallHeaderHandler({ channelId }: Props) {
    const { selfUser } = useAuthContext();
    const { activeCallRequest, isCallActive, startDirectCall } = useCallContext();
    const { peerUser, isLoading } = useDirectChannel(
        {
            channelId: channelId,
            localUserId: selfUser?.id
        });

    const isCurrentChannelCall = activeCallRequest?.channelId === channelId;
    const isCallControlsDisabled = isCallActive && !isCurrentChannelCall;
    const callTooltipLabel = useMemo(() => {
        if (isCurrentChannelCall) {
            return 'Звонок уже активен';
        }

        if (isCallControlsDisabled) {
            return 'Сначала завершите текущий звонок';
        }

        return '';
    }, [isCallControlsDisabled, isCurrentChannelCall]);

    const handleStartCall = (startWithCam: boolean) => {
        if (!peerUser || !selfUser || isCallActive) return;

        startDirectCall({
            peerUserId: peerUser.id,
            peerUsername: peerUser.username,
            peerAvatarUrl: resolveAssetUrl(peerUser.avatarUrl) ?? peerUser.avatarUrl,
            initiatorUsername: selfUser.username,
            initiatorAvatarUrl: resolveAssetUrl(selfUser.avatarUrl) ?? selfUser.avatarUrl,
            channelId,
            isInitiator: true,
            isCamOn: startWithCam,
        });
    };

    return (
        <div className="shrink-0">
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
                            {isCurrentChannelCall && (
                                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                                    В звонке
                                </span>
                            )}
                        </>
                    ) : null}
                </div>
                <div className="flex gap-4 text-gray-300">
                    <button
                        type="button"
                        onClick={() => handleStartCall(false)}
                        disabled={isCallControlsDisabled || isCurrentChannelCall}
                        title={callTooltipLabel || 'Начать голосовой звонок'}
                        className="transition disabled:cursor-not-allowed disabled:text-gray-500"
                    >
                        <Phone className="hover:text-white cursor-pointer w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleStartCall(true)}
                        disabled={isCallControlsDisabled || isCurrentChannelCall}
                        title={callTooltipLabel || 'Начать видеозвонок'}
                        className="transition disabled:cursor-not-allowed disabled:text-gray-500"
                    >
                        <Video className="hover:text-white cursor-pointer w-5 h-5" />
                    </button>
                    <Settings className="hover:text-white cursor-pointer w-5 h-5" />
                </div>
            </div>
        </div>
    )
}
