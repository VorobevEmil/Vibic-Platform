import { useParams } from "react-router-dom";
import AppShell from "../layout/AppShell";
import ServerChannelListSidebar from "../components/Server/ServerChannelListSidebar";
import ServerChatCenterPanel from "../components/Server/ServerChatCenterPanel";
import { useEffect, useState } from "react";
import { serversApi } from "../api/serversApi";
import { ServerFullResponse } from "../types/ServerType";

export default function ServerPage() {
    const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>();
    const [server, setServer] = useState<ServerFullResponse | null>(null);

    useEffect(() => {
        const initializeServer = async () => {
            const response = await serversApi.getServerById(serverId!);
            if (response.status !== 200) return;
            setServer(response.data);
        };
        initializeServer();
    }, [serverId]);

    const currentChannel = server?.channels?.find(c => c.id === channelId);

    return (
        <AppShell>
            <ServerChannelListSidebar serverId={serverId!} channels={server?.channels ?? []} />
            {channelId ? (
                <ServerChatCenterPanel channelId={channelId} name={currentChannel?.name ?? 'Unknown Channel'} />
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    Выберите канал
                </div>
            )}
        </AppShell>
    );
}
