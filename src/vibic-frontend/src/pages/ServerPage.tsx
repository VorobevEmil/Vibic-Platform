import { useNavigate, useParams } from "react-router-dom";
import ServerChannelListSidebar from "../components/Server/ServerChannelListSidebar";
import { useEffect, useRef, useState } from "react";
import { serversApi } from "../api/serversApi";
import { channelsApi } from "../api/channelsApi";
import { ServerFullResponse } from "../types/ServerType";
import ChatCenterPanel from "../components/Chat/ChatCenterPanel";
import { ChannelType } from "../types/enums/ChannelType";
import { useVoice } from "../context/VoiceContext";
import { useHeaderContext } from "../context/HeaderContext";
import { useRightSidebarContext } from "../context/RightSidebarContext";
import { resolveAssetUrl } from "../api/httpClient";
import ServerChannelMembersSidebar from "../components/Server/ServerChannelMembersSidebar";
import { useAuthContext } from "../context/AuthContext";
import { Users } from "lucide-react";
import Skeleton from "../components/ui/Skeleton";

function ServerPageContent({ serverId, channelId }: { serverId: string; channelId?: string }) {
    const [server, setServer] = useState<ServerFullResponse>();
    const { joinServer, leaveServer } = useVoice();
    const { setHeader } = useHeaderContext();
    const { setSidebar, isVisible, toggleVisibility } = useRightSidebarContext();
    const { selfUser } = useAuthContext();
    const navigate = useNavigate();
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
                channelId={channelId}
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

    const handleServerUpdate = async (name: string, iconFile: File | null) => {
        try {
            const response = await serversApi.updateServer(serverId, name, iconFile);
            if (server) {
                setServer({ ...server, name: response.data.name, iconUrl: response.data.iconUrl });
                setHeader({ title: response.data.name, iconUrl: resolveAssetUrl(response.data.iconUrl) });
            }
            window.dispatchEvent(new CustomEvent('server-list-changed'));
        } catch (error) {
            console.error('Ошибка при обновлении сервера:', error);
        }
    };

    const handleServerDelete = async () => {
        try {
            await serversApi.deleteServer(serverId);
            window.dispatchEvent(new CustomEvent('server-list-changed'));
            navigate('/');
        } catch (error) {
            console.error('Ошибка при удалении сервера:', error);
        }
    };

    const handleChannelUpdated = (updatedChannel: ServerFullResponse['channels'][number]) => {
        setServer((currentServer) => {
            if (!currentServer) {
                return currentServer;
            }

            return {
                ...currentServer,
                channels: currentServer.channels.map((channel) =>
                    channel.id === updatedChannel.id ? updatedChannel : channel),
            };
        });

        window.dispatchEvent(new CustomEvent('server-list-changed'));
    };

    const handleChannelDeleted = async (deletedChannelId: string) => {
        await channelsApi.deleteServerChannel(serverId, deletedChannelId);

        let nextChannelId: string | null = null;

        setServer((currentServer) => {
            if (!currentServer) {
                return currentServer;
            }

            const remainingChannels = currentServer.channels.filter((channel) => channel.id !== deletedChannelId);
            const preferredNextChannel = remainingChannels.find((channel) => channel.channelType === ChannelType.Server && channel.isPublic)
                ?? remainingChannels[0]
                ?? null;

            nextChannelId = preferredNextChannel?.id ?? null;

            return {
                ...currentServer,
                channels: remainingChannels,
            };
        });

        if (channelId === deletedChannelId && nextChannelId) {
            navigate(`/channels/${serverId}/${nextChannelId}`, { replace: true });
        }

        window.dispatchEvent(new CustomEvent('server-list-changed'));
    };

    return (
        <>
            <ServerChannelListSidebar
                serverName={server?.name ?? 'Unknown'}
                serverId={serverId}
                serverIconUrl={server?.iconUrl}
                isOwner={!!selfUser && !!server && server.ownerId === selfUser.id}
                channels={server?.channels ?? []}
                serverMembers={server?.members ?? []}
                isLoading={!server}
                onChannelCreated={(channel) => {
                    if (!server) return;
                    setServer({ ...server, channels: [...server.channels, channel] });
                }}
                onChannelUpdated={handleChannelUpdated}
                onChannelDeleted={async (deletedChannelId) => {
                    await handleChannelDeleted(deletedChannelId);
                }}
                onServerUpdated={handleServerUpdate}
                onServerDeleted={handleServerDelete}
            />
            {channelId ? (
                <ChatCenterPanel channelType={ChannelType.Server} serverId={serverId} channelId={channelId}>
                    <div className="h-12 px-4 flex items-center justify-between border-b border-[#1e1f22]">
                        {server ? (
                            <h1 className="text-lg font-bold text-white"># {currentChannel?.name ?? 'Unknown Channel'}</h1>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded-md" />
                                <Skeleton className="h-6 w-40 rounded-lg" />
                            </div>
                        )}
                        <div className="relative group">
                            <button
                                type="button"
                                onClick={toggleVisibility}
                                disabled={!server}
                                className={`rounded-lg p-1.5 transition ${isVisible ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Users className="h-5 w-5" />
                            </button>
                            <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-max rounded-lg bg-[#111214] px-3 py-2 text-sm text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                                {isVisible ? 'Скрыть список участников' : 'Показать список участников'}
                            </div>
                        </div>
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
