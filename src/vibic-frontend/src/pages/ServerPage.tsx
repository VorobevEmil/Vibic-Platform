import { useParams } from "react-router-dom";
import AppShell from "../layout/AppShell";
import ServerChannelListSidebar from "../components/Server/ServerChannelListSidebar";
import { useEffect, useRef, useState } from "react";
import { serversApi } from "../api/serversApi";
import { ServerFullResponse } from "../types/ServerType";
import ChatCenterPanel from "../components/Chat/ChatCenterPanel";
import { ChannelType } from "../types/enums/ChannelType";
import { useVoice } from "../context/VoiceContext";
import { useHeaderContext } from "../context/HeaderContext";
import { resolveAssetUrl } from "../api/httpClient";

function ServerPageContent({ serverId, channelId }: { serverId: string; channelId?: string }) {
    const [server, setServer] = useState<ServerFullResponse>();
    const { joinServer, leaveServer } = useVoice();
    const { setHeader } = useHeaderContext();
    const joinedServerRef = useRef<string | null>(null);

    useEffect(() => {
        const initializeServer = async () => {

            try {
                const response = await serversApi.getServerById(serverId);

                setServer(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке сервера:', error);
            }
        };
        initializeServer();
    }, [serverId]);

    useEffect(() => {
        if (!server) return;

        const voiceChannelIds = server.channels
            .filter(c => c.channelType === ChannelType.Voice)
            .map(c => c.id);

        joinServer(serverId, voiceChannelIds);
        joinedServerRef.current = serverId;

        setHeader({
            title: server.name,
            iconUrl: resolveAssetUrl(server.iconUrl),
        });
    }, [server, serverId, joinServer, setHeader]);

    useEffect(() => {
        return () => {
            if (joinedServerRef.current) {
                leaveServer(joinedServerRef.current);
                joinedServerRef.current = null;
            }
            setHeader(null);
        };
    }, [leaveServer, setHeader]);

    const currentChannel = server?.channels?.find(c => c.id === channelId);

    return (
        <>
            <ServerChannelListSidebar
                serverName={server?.name ?? 'Unknown'}
                serverId={serverId}
                channels={server?.channels ?? []}
                onChannelCreated={(channel) => {
                    if (!server) return;
                    setServer({ ...server, channels: [...server.channels, channel] });
                }}
            />
            {channelId ? (
                <ChatCenterPanel channelType={ChannelType.Server} serverId={serverId} channelId={channelId}>
                    <div className="h-12 px-4 flex items-center border-b border-[#1e1f22]">
                        <h1 className="text-lg font-bold text-white"># {currentChannel?.name ?? 'Unknown Channel'}</h1>
                    </div>
                </ChatCenterPanel>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    Выберите канал
                </div>
            )}
        </>
    );
}

export default function ServerPage() {
    const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>();

    if (!serverId) {
        return (
            <AppShell>
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    Сервер не найден
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <ServerPageContent serverId={serverId} channelId={channelId} />
        </AppShell>
    );
}
