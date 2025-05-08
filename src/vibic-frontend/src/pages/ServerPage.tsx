import { useParams } from "react-router-dom";
import AppShell from "../layout/AppShell";
import ServerChannelListSidebar from "../components/Server/ServerChannelListSidebar";
import { useEffect, useState } from "react";
import { serversApi } from "../api/serversApi";
import { ServerChannelResponse, ServerFullResponse } from "../types/ServerType";
import ChatCenterPanel from "../components/Chat/ChatCenterPanel";
import { ChannelType } from "../types/enums/ChannelType";

export default function ServerPage() {
    const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>();
    const [server, setServer] = useState<ServerFullResponse>();

    useEffect(() => {
        const initializeServer = async () => {

            try {
                const response = await serversApi.getServerById(serverId!);

                setServer(response.data);
            } catch (error) {

            }
        };
        initializeServer();
    }, [serverId]);

    const currentChannel = server?.channels?.find(c => c.id === channelId);

    return (
        <AppShell>
            <ServerChannelListSidebar
                serverName={server?.name ?? 'Unknown'}
                serverId={serverId!}
                channels={server?.channels ?? []}
                onChannelCreated={(channel) => {
                    if (!server) return;
                    setServer({ ...server, channels: [...server.channels, channel] });
                }} />
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
        </AppShell>
    );
}
