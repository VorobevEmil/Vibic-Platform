import { useEffect, useState } from 'react';
import FooterProfilePanel from '../../Layout/FooterProfilePanel';
import { X } from 'lucide-react';
import { channelsApi } from '../../../api/channelsApi';
import SearchUserOverlay from '../../SearchUserOverlay/SearchUserOverlay';
import { useAuthContext } from '../../../context/AuthContext';
import DirectChannelType from '../../../types/DirectChannelType';
import { useNavigate } from 'react-router-dom';


export default function DirectChannelListSidebar() {
    const { selfUser: user } = useAuthContext();
    const [channels, setChannels] = useState<DirectChannelType[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDMs = async () => {
            try {
                const response = await channelsApi.getDirectChannels();
                const channels = response.data;
                setChannels(channels);
            } catch (err) {
                console.error('Failed to load channels:', err);
            }
        };

        fetchDMs();
    }, []);

    const [searchOpen, setSearchOpen] = useState(false);

    const onUpdateChannel = (channel: DirectChannelType) => {
        setChannels((prevChannels) => [...prevChannels, channel]);
    }

    return (
        <div className="w-64 bg-[#2b2d31] flex flex-col justify-between">
            <div className="p-4">
                <button
                    onClick={() => setSearchOpen(true)}
                    className="w-full text-left px-3 py-2 rounded-md bg-[#1e1f22] text-sm text-white placeholder-gray-400 hover:bg-[#3c3e45] transition"
                >
                    Найти или начать беседу
                </button>
                <div className="mt-4 text-sm text-gray-400">Личные сообщения</div>

                <div className="mt-2 space-y-2">
                    {channels.map((channel) => {
                        const channelMember = channel.channelMembers.find(cm => cm.userId !== user?.id);
                        if (!channelMember) return null;

                        return (
                            <div
                                key={channel.id}
                                className="group flex items-center justify-between gap-2 p-2 hover:bg-[#3c3e45] rounded-lg cursor-pointer"
                                onClick={() => navigate(`/channels/@me/${channel.id}`)}
                            >
                                <div className="flex items-center gap-2">
                                    <img src={channelMember.avatarUrl}
                                        className="w-8 h-8 rounded-full"
                                        alt={channelMember.displayName}
                                    />
                                    <span className="text-sm">{channelMember.displayName}</span>
                                </div>

                                <button
                                    className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => console.log(`Close DM with ${channelMember.displayName}`)}
                                >
                                    <X className="h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <FooterProfilePanel />

            <SearchUserOverlay channels={channels} onUpdateChannel={onUpdateChannel} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
