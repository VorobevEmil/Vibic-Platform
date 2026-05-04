import { useEffect, useState } from 'react';
import { BellOff, Search, X } from 'lucide-react';
import { channelsApi } from '../../../api/channelsApi';
import SearchUserOverlay from '../../SearchUserOverlay/SearchUserOverlay';
import { useAuthContext } from '../../../context/AuthContext';
import DirectChannelResponse from '../../../types/channels/DirectChannelType';
import { useNavigate, useParams } from 'react-router-dom';
import { resolveAssetUrl } from '../../../api/httpClient';
import Skeleton from '../../ui/Skeleton';
import { useUnreadContext } from '../../../context/UnreadContext';
import { chatHubConnection } from '../../../services/signalRClient';
import { chatMessageBus } from '../../../services/chatMessageBus';

export default function DirectChannelListSidebar() {
    const { selfUser: user } = useAuthContext();
    const { id: activeChannelId } = useParams<{ id: string }>();
    const [channels, setChannels] = useState<DirectChannelResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const { unreadCounts, markRead, toggleMute, isMuted } = useUnreadContext();

    useEffect(() => {
        const fetchDMs = async () => {
            setIsLoading(true);
            try {
                const response = await channelsApi.getDirectChannels();
                setChannels(response.data);
            } catch (err) {
                console.error('Failed to load channels:', err);
            } finally {
                setIsLoading(false);
            }
        };
        void fetchDMs();
    }, []);

    // Join all DM channels silently so we receive messages from background channels
    useEffect(() => {
        if (channels.length === 0) return;

        const joinAll = async () => {
            try {
                if (chatHubConnection.state === 'Disconnected') {
                    await chatHubConnection.start();
                }
                // Ensure bus is initialized before we join channels
                chatMessageBus.onMessage(() => {})();
                for (const ch of channels) {
                    try {
                        await chatHubConnection.invoke('JoinChannel', ch.id);
                    } catch {
                        // Already joined or not connected — ignore
                    }
                }
            } catch {
                // Connection not ready yet — SignalR will re-join on next navigation
            }
        };

        void joinAll();
    }, [channels]);

    const onUpdateChannel = (channel: DirectChannelResponse) => {
        setChannels((prev) => [...prev, channel]);
    };

    const handleCloseChannel = async (e: React.MouseEvent, channelId: string) => {
        e.stopPropagation();
        try {
            await channelsApi.closeDirectChannel(channelId);
            setChannels(prev => prev.filter(c => c.id !== channelId));
            if (channelId === activeChannelId) navigate('/channels/@me');
        } catch (err) {
            console.error('Failed to close channel:', err);
        }
    };

    const handleNavigate = (channelId: string) => {
        markRead(channelId);
        navigate(`/channels/@me/${channelId}`);
    };

    return (
        <div className="h-full w-60 bg-[#171b27] border-r border-white/[0.05] flex flex-col">
            {/* Search */}
            <div className="px-3 pt-4 pb-2 shrink-0">
                <button
                    onClick={() => setSearchOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0e1016] hover:bg-[#1c2032] text-sm text-[#555c78] hover:text-[#8b90a8] transition-all duration-150 border border-white/[0.04]"
                >
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span>Найти беседу</span>
                </button>
            </div>

            {/* DM list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {(channels.length > 0 || isLoading) && (
                    <p className="px-2 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#3d4465]">
                        Личные сообщения
                    </p>
                )}

                <div className="space-y-0.5">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3.5 w-24 rounded-md" />
                                    <Skeleton className="h-3 w-16 rounded-md" />
                                </div>
                            </div>
                        ))
                    ) : channels.length === 0 ? (
                        <div className="px-2 py-5 text-sm text-[#3d4465] text-center leading-relaxed">
                            Здесь появятся ваши<br />личные сообщения.
                        </div>
                    ) : channels.map((channel) => {
                        const member = channel.channelMembers.find(cm => cm.userId !== user?.id);
                        if (!member) return null;

                        const isActive = channel.id === activeChannelId;
                        const muted = isMuted(channel.id);
                        const unread = unreadCounts[channel.id] ?? 0;
                        const hasUnread = unread > 0 && !muted;

                        return (
                            <div
                                key={channel.id}
                                className={`group relative flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                                    isActive
                                        ? 'bg-[#252c3f] text-white'
                                        : hasUnread
                                            ? 'text-white hover:bg-[#1c2032]'
                                            : 'text-[#6b7292] hover:bg-[#1c2032] hover:text-[#c8cce0]'
                                }`}
                                onClick={() => handleNavigate(channel.id)}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="relative shrink-0">
                                        <img
                                            src={resolveAssetUrl(member.avatarUrl)}
                                            className="w-8 h-8 rounded-full object-cover"
                                            alt={member.displayName}
                                        />
                                        {/* Unread indicator dot on avatar */}
                                        {hasUnread && !isActive && (
                                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#171b27] flex items-center justify-center">
                                                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className={`text-sm truncate font-medium block ${hasUnread && !isActive ? 'font-semibold' : ''}`}>
                                            {member.displayName}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {/* Unread count badge */}
                                    {hasUnread && !isActive && (
                                        <span className="min-w-[18px] h-[18px] rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                                            {unread > 99 ? '99+' : unread}
                                        </span>
                                    )}

                                    {/* Mute button (on hover) */}
                                    <button
                                        className={`opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center transition-all ${
                                            muted ? 'opacity-100 text-[#555c78]' : 'text-[#555c78] hover:text-white'
                                        }`}
                                        onClick={(e) => { e.stopPropagation(); toggleMute(channel.id); }}
                                        title={muted ? 'Включить уведомления' : 'Отключить уведомления'}
                                    >
                                        <BellOff className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Close button (on hover) */}
                                    <button
                                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-[#555c78] hover:text-white transition-all"
                                        onClick={(e) => handleCloseChannel(e, channel.id)}
                                        title="Закрыть"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <SearchUserOverlay
                channels={channels}
                onUpdateChannel={onUpdateChannel}
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </div>
    );
}
