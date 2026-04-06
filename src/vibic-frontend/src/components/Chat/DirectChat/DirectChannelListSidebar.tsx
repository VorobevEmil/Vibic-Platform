import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { channelsApi } from '../../../api/channelsApi';
import SearchUserOverlay from '../../SearchUserOverlay/SearchUserOverlay';
import { useAuthContext } from '../../../context/AuthContext';
import DirectChannelResponse from '../../../types/channels/DirectChannelType';
import { useNavigate, useParams } from 'react-router-dom';
import { resolveAssetUrl } from '../../../api/httpClient';


export default function DirectChannelListSidebar() {
    const { selfUser: user } = useAuthContext();
    const { id: activeChannelId } = useParams<{ id: string }>();
    const [channels, setChannels] = useState<DirectChannelResponse[]>([]);
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const fetchDMs = async () => {
            try {
                const response = await channelsApi.getDirectChannels();
                setChannels(response.data);
            } catch (err) {
                console.error('Failed to load channels:', err);
            }
        };
        fetchDMs();
    }, []);

    const onUpdateChannel = (channel: DirectChannelResponse) => {
        setChannels((prev) => [...prev, channel]);
    };

    return (
        <div className="h-full w-60 bg-[#2b2d31] border-r border-white/[0.06] flex flex-col">
            {/* Search */}
            <div className="px-3 pt-4 pb-2 shrink-0">
                <button
                    onClick={() => setSearchOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e1f22] hover:bg-[#1a1b1e] text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span>Найти беседу</span>
                </button>
            </div>

            {/* DM list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {channels.length > 0 && (
                    <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                        Личные сообщения
                    </p>
                )}

                <div className="space-y-0.5">
                    {channels.map((channel) => {
                        const member = channel.channelMembers.find(cm => cm.userId !== user?.id);
                        if (!member) return null;

                        const isActive = channel.id === activeChannelId;

                        return (
                            <div
                                key={channel.id}
                                className={`group flex items-center justify-between gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                                    isActive
                                        ? 'bg-[#404249] text-white'
                                        : 'text-gray-400 hover:bg-[#35373c] hover:text-gray-200'
                                }`}
                                onClick={() => navigate(`/channels/@me/${channel.id}`)}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                        src={resolveAssetUrl(member.avatarUrl)}
                                        className="w-8 h-8 rounded-full object-cover shrink-0"
                                        alt={member.displayName}
                                    />
                                    <span className="text-sm truncate font-medium">{member.displayName}</span>
                                </div>

                                <button
                                    className="opacity-0 group-hover:opacity-100 shrink-0 w-5 h-5 rounded flex items-center justify-center hover:text-white transition-all"
                                    onClick={(e) => { e.stopPropagation(); }}
                                    title="Закрыть"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
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
