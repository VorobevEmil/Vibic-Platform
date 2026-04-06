import { useParams } from "react-router-dom";
import ServerChannelListSidebar from "../components/Server/ServerChannelListSidebar";
import { useEffect, useRef, useState } from "react";
import { serversApi } from "../api/serversApi";
import { ServerFullResponse } from "../types/ServerType";
import ChatCenterPanel from "../components/Chat/ChatCenterPanel";
import { ChannelType } from "../types/enums/ChannelType";
import { useVoice } from "../context/VoiceContext";
import { useHeaderContext } from "../context/HeaderContext";
import { useRightSidebarContext } from "../context/RightSidebarContext";
import { resolveAssetUrl } from "../api/httpClient";
import ServerChannelMembersSidebar from "../components/Server/ServerChannelMembersSidebar";

function ServerPageContent({ serverId, channelId }: { serverId: string; channelId?: string }) {
    const [server, setServer] = useState<ServerFullResponse>();
    const { joinServer, leaveServer } = useVoice();
    const { setHeader } = useHeaderContext();
    const { setSidebar } = useRightSidebarContext();
    const joinedServerRef = useRef<string | null>(null);
    const leaveServerRef = useRef(leaveServer);
    const setHeaderRef = useRef(setHeader);
    const setSidebarRef = useRef(setSidebar);
    leaveServerRef.current = leaveServer;
    setHeaderRef.current = setHeader;
    setSidebarRef.current = setSidebar;
    const currentChannel = server?.channels?.find(c => c.id === channelId);

    useEffect(() => {
        const initializeServer = async () => {
            setServer(undefined);

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

        if (joinedServerRef.current && joinedServerRef.current !== serverId) {
            leaveServer(joinedServerRef.current);
        }

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
        if (!server || !channelId || !currentChannel) {
            setSidebar(null);
            return;
        }

        setSidebar(
            <ServerChannelMembersSidebar
                key={`${serverId}:${channelId}`}
                serverId={serverId}
                serverName={server.name}
                channelId={channelId}
                channelName={currentChannel.name}
                isPublic={currentChannel.isPublic}
            />
        );
    }, [channelId, currentChannel, server, serverId, setSidebar]);

    useEffect(() => {
        return () => {
            if (joinedServerRef.current) {
                leaveServerRef.current(joinedServerRef.current);
                joinedServerRef.current = null;
            }
            setHeaderRef.current(null);
            setSidebarRef.current(null);
        };
    }, []);

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
            <div className="flex-1 flex items-center justify-center text-gray-400">
                Сервер не найден
            </div>
        );
    }

    return <ServerPageContent serverId={serverId} channelId={channelId} />;
}
